"use client";

import { useState } from "react";
import {
  type ChatMessage,
  type ChatSession,
  generateId,
  getSimulatedResponse,
} from "@/lib/helper";
import { ChatPanel } from "./chat-panel";
import { ChatSidebar } from "./chat-sidebar";
import { WELCOME_MESSAGE } from "./constants";

export function ChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Chat sessions (sidebar)
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "default",
      title: "New conversation",
      lastMessage: "How can I help you today?",
      createdAt: new Date(),
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>("default");

  function handleNewChat() {
    const newId = generateId();
    const newSession: ChatSession = {
      id: newId,
      title: "New conversation",
      lastMessage: "How can I help you today?",
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGE,
        createdAt: new Date(),
      },
    ]);
    setInput("");
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Update session title to first user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "..." : ""),
              lastMessage: trimmed,
            }
          : s,
      ),
    );

    // Simulate AI response
    setTimeout(
      () => {
        const aiMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: getSimulatedResponse(trimmed),
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
      },
      1200 + Math.random() * 800,
    );
  }

  return (
    <main className="flex h-[calc(100vh-64px)] bg-[oklch(0.06_0.01_145)]">
      {/* Left Sidebar — recent chats */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
      />

      {/* Right — Chat panel */}
      <ChatPanel
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onSuggestionClick={setInput}
      />
    </main>
  );
}
