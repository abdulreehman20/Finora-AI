"use client";

import {
  IconArrowUp,
  IconClock,
  IconCopy,
  IconLoader2,
  IconMessageChatbot,
  IconPaperclip,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/helper";
import { CHAT_SUGGESTIONS } from "./constants";

interface ChatPanelProps {
  messages: ChatMessage[];
  isNewConversation: boolean;
  welcomeMessage: string;
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onSuggestionClick: (suggestion: string) => void;
  onCopyResponse: (text: string) => void;
  responseTimes: Record<string, number>;
}

export function ChatPanel({
  messages,
  isNewConversation,
  welcomeMessage,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onSuggestionClick,
  onCopyResponse,
  responseTimes,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Messages Area */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full min-w-0 space-y-6 px-6 py-6">
          {isNewConversation && (
            <div className="flex min-h-[45vh] items-center justify-center px-4">
              <p className="max-w-2xl text-center text-base text-zinc-300">
                {welcomeMessage}
              </p>
            </div>
          )}
          {messages.map((msg) =>
            msg.role === "assistant" ? (
              <div key={msg.id} className="flex w-full min-w-0 gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                  <IconSparkles size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="w-fit max-w-full rounded-2xl rounded-bl-md border border-white/5 bg-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                    {/* {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))} */}
                    <div className="prose prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                    <button
                      type="button"
                      onClick={() => onCopyResponse(msg.content)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-zinc-300"
                    >
                      <IconCopy size={13} />
                      Copy
                    </button>
                    <span className="inline-flex items-center gap-1">
                      <IconClock size={13} />
                      {(responseTimes[msg.id] ?? 0).toFixed(2)}s
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="flex w-full min-w-0 justify-end gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="ml-auto w-fit max-w-full rounded-2xl rounded-br-md bg-green-500 px-4 py-3 text-right text-sm leading-relaxed text-white">
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-white">
                  <IconMessageChatbot size={14} />
                </div>
              </div>
            ),
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex w-full min-w-0 gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <IconSparkles size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="w-fit max-w-full rounded-2xl rounded-bl-md border border-white/5 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <IconLoader2 size={14} className="animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions (shown when few messages) */}
      {messages.length <= 1 && (
        <div className="w-full min-w-0 px-6 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  onSuggestionClick(suggestion);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-400 hover:bg-white/10 hover:text-zinc-200 hover:border-white/20 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 bg-[oklch(0.06_0.01_145)]">
        <div className="w-full min-w-0 px-6 py-4">
          <form onSubmit={onSubmit} className="relative">
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all shrink-0"
                title="Attach file"
              >
                <IconPaperclip size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Finora AI..."
                rows={1}
                className="flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder-zinc-500 outline-none min-h-[40px] max-h-[200px]"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
              >
                {isLoading ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconArrowUp size={16} />
                )}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-[10px] text-zinc-600">
            Finora AI can make mistakes. Consider checking important financial
            data.
          </p>
        </div>
      </div>
    </div>
  );
}
