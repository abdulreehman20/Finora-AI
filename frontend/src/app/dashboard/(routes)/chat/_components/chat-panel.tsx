"use client";

import {
  IconArrowUp,
  IconLoader2,
  IconMessageChatbot,
  IconPaperclip,
  IconSparkles,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/helper";
import { CHAT_SUGGESTIONS } from "./constants";

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatPanel({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onSuggestionClick,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white mt-1 shadow-lg shadow-green-500/20">
                  <IconSparkles size={14} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-green-500 text-white rounded-br-md"
                    : "bg-white/5 text-zinc-300 border border-white/5 rounded-bl-md"
                }`}
              >
                {msg.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {line
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-white font-semibold">$1</strong>',
                      )
                      .includes("<strong") ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: line.replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-white font-semibold">$1</strong>',
                          ),
                        }}
                      />
                    ) : (
                      line
                    )}
                    {i < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-white mt-1">
                  <IconMessageChatbot size={14} />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white mt-1">
                <IconSparkles size={14} />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white/5 border border-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <IconLoader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions (shown when few messages) */}
      {messages.length <= 1 && (
        <div className="mx-auto max-w-[1400px] px-6 pb-3 w-full">
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
        <div className="mx-auto max-w-[1400px] px-6 py-4">
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
