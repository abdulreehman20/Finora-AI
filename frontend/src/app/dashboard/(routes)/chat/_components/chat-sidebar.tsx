"use client";

import { IconMessageChatbot, IconPlus } from "@tabler/icons-react";
import type { ChatSession } from "@/lib/helper";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-[oklch(0.08_0.01_145)]">
      {/* New Chat Button */}
      <div className="p-4 border-b border-white/10">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
        >
          <IconPlus size={16} />
          New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-2 pb-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          Recent Chats
        </p>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
            <IconMessageChatbot size={28} className="mb-2" />
            <p className="text-xs">No conversations yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session.id)}
              className={`flex w-full flex-col items-start rounded-lg px-3 py-2.5 text-left transition-all ${
                activeSessionId === session.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <span className="text-sm font-medium truncate w-full">
                {session.title}
              </span>
              <span className="text-[11px] text-zinc-500 truncate w-full mt-0.5">
                {session.lastMessage}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
