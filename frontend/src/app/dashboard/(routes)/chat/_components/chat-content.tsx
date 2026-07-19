"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { ChatMessage, ChatSession } from "@/lib/helper";
import { ChatPanel } from "./chat-panel";
import { ChatSidebar } from "./chat-sidebar";
import { WELCOME_MESSAGE } from "./constants";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const CHAT_TITLE_MAX = 40;

interface BackendSession {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

function toChatMessage(item: BackendMessage): ChatMessage {
  return {
    id: item.id,
    role: item.role,
    content: item.content,
    createdAt: new Date(item.createdAt),
  };
}

interface ChatContentProps {
  initialSessionId?: string;
}

export function ChatContent({ initialSessionId }: ChatContentProps) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>(
    {},
  );

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [renamedSessions, setRenamedSessions] = useState<
    Record<string, string>
  >({});
  const [archivedSessionIds, setArchivedSessionIds] = useState<string[]>([]);

  const authHeaders = useMemo(() => {
    const tokenCandidate = (sessionData as Record<string, unknown> | null)
      ?.session as Record<string, unknown> | undefined;
    const token =
      (tokenCandidate?.token as string | undefined) ??
      ((sessionData as Record<string, unknown> | null)?.token as
        | string
        | undefined);

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [sessionData]);

  const mapSession = useCallback(
    (item: BackendSession): ChatSession => ({
      id: item.id,
      title: renamedSessions[item.id] ?? item.title ?? "New conversation",
      lastMessage: "Continue this conversation",
      createdAt: new Date(item.createdAt),
    }),
    [renamedSessions],
  );

  const fetchSessions = useCallback(async () => {
    const res = await fetch(`${BACKEND_URL}/api/agent/history`, {
      method: "GET",
      credentials: "include",
      headers: authHeaders,
    });

    if (!res.ok) {
      throw new Error("Failed to load chat sessions");
    }

    const data = (await res.json()) as { sessions: BackendSession[] };
    setSessions(
      data.sessions
        .filter((session) => !archivedSessionIds.includes(session.id))
        .map(mapSession),
    );
  }, [archivedSessionIds, authHeaders, mapSession]);

  const loadMessages = useCallback(
    async (sessionId: string) => {
      const res = await fetch(`${BACKEND_URL}/api/agent/history/${sessionId}`, {
        method: "GET",
        credentials: "include",
        headers: authHeaders,
      });

      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error("Failed to load chat history");
      }

      const data = (await res.json()) as { messages: BackendMessage[] };
      if (!data.messages.length) {
        setMessages([]);
        return [];
      }
      const mapped = data.messages.map(toChatMessage);
      setMessages(mapped);
      return mapped;
    },
    [authHeaders],
  );

  useEffect(() => {
    if (initialSessionId) {
      setActiveSessionId(initialSessionId);
    } else {
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [initialSessionId]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        await fetchSessions();
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unable to load sessions";
        toast.error(msg);
      } finally {
        setIsHydrating(false);
      }
    };
    void hydrate();
  }, [fetchSessions]);

  useEffect(() => {
    if (!activeSessionId) return;

    const run = async () => {
      try {
        await loadMessages(activeSessionId);
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unable to load history";
        toast.error(msg);
      }
    };
    void run();
  }, [activeSessionId, loadMessages]);

  function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    router.push("/dashboard/chat");
  }

  async function sendMessage(message: string) {
    const startedAt = performance.now();
    const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders,
      body: JSON.stringify({
        message,
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      }),
    });

    if (!res.ok) {
      const error = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      const rawMessage = error?.message ?? "Failed to send message";
      const normalized = rawMessage.toLowerCase();
      if (
        normalized.includes("rate") ||
        normalized.includes("quota") ||
        normalized.includes("429") ||
        normalized.includes("resource exhausted")
      ) {
        throw new Error(
          "You have reached today's limit. For further use, please wait 12 hours.",
        );
      }
      throw new Error(rawMessage);
    }

    const data = (await res.json()) as {
      sessionId: string;
      title?: string | null;
    };

    const previousSessionId = activeSessionId;
    setActiveSessionId(data.sessionId);
    router.replace(`/dashboard/chat?sessionId=${data.sessionId}`);
    if (!previousSessionId) {
      setSessions((prev) => [
        {
          id: data.sessionId,
          title:
            data.title?.trim().slice(0, CHAT_TITLE_MAX) || "New conversation",
          lastMessage: "Continue this conversation",
          createdAt: new Date(),
        },
        ...prev,
      ]);
    }

    const loadedMessages = await loadMessages(data.sessionId);
    const lastAssistant = [...loadedMessages]
      .reverse()
      .find((item) => item.role === "assistant");
    if (lastAssistant) {
      setResponseTimes((prev) => ({
        ...prev,
        [lastAssistant.id]: Math.max(
          0.01,
          (performance.now() - startedAt) / 1000,
        ),
      }));
    }
    await fetchSessions();
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setIsLoading(true);
    try {
      await sendMessage(trimmed);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Unable to send message";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRenameSession(sessionId: string, title: string) {
    const sanitized = title.trim();
    if (!sanitized) return;

    setRenamedSessions((prev) => ({
      ...prev,
      [sessionId]:
        sanitized.slice(0, CHAT_TITLE_MAX) +
        (sanitized.length > CHAT_TITLE_MAX ? "..." : ""),
    }));
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, title: sanitized } : session,
      ),
    );
  }

  async function handleArchiveSession(sessionId: string) {
    setArchivedSessionIds((prev) => [...new Set([...prev, sessionId])]);
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
      router.replace("/dashboard/chat");
    }
  }

  async function handleDeleteSession(sessionId: string) {
    const res = await fetch(`${BACKEND_URL}/api/ai/session/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
      headers: authHeaders,
    });
    if (!res.ok) {
      const error = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(error?.message ?? "Failed to delete session");
    }

    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
      router.replace("/dashboard/chat");
    }
    await fetchSessions();
  }

  return (
    <main className="flex h-[calc(100vh-64px)] mx-auto w-full max-w-[1400px]">
      {/* Left Sidebar — recent chats */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(sessionId) => {
          setActiveSessionId(sessionId);
          router.push(`/dashboard/chat?sessionId=${sessionId}`);
        }}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onArchiveSession={handleArchiveSession}
        onDeleteSession={async (sessionId) => {
          try {
            await handleDeleteSession(sessionId);
          } catch (error) {
            const msg =
              error instanceof Error
                ? error.message
                : "Failed to delete session";
            toast.error(msg);
          }
        }}
        isLoading={isHydrating}
      />

      {/* Right — Chat panel */}
      <ChatPanel
        messages={messages}
        isNewConversation={!activeSessionId}
        welcomeMessage={WELCOME_MESSAGE}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onSuggestionClick={setInput}
        onCopyResponse={(value) => {
          void navigator.clipboard.writeText(value);
          toast.success("Response copied");
        }}
        responseTimes={responseTimes}
      />
    </main>
  );
}
