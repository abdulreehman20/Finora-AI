"use client";

import {
  IconArchive,
  IconDots,
  IconMessageChatbot,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatSession } from "@/lib/helper";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, title: string) => void;
  onArchiveSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isLoading: boolean;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onArchiveSession,
  onDeleteSession,
  isLoading,
}: ChatSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteDialogSessionId, setDeleteDialogSessionId] = useState<
    string | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingSessionId) return;
    inputRef.current?.focus();
  }, [editingSessionId]);

  function startRename(session: ChatSession) {
    setEditingSessionId(session.id);
    setEditingValue(session.title);
  }

  function commitRename(sessionId: string) {
    const value = editingValue.trim();
    if (value.length > 0) {
      onRenameSession(sessionId, value);
    }
    setEditingSessionId(null);
    setEditingValue("");
  }

  return (
    <>
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10">
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
          {isLoading ? (
            <div className="px-2 py-4 text-xs text-zinc-500">
              Loading chats...
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
              <IconMessageChatbot size={28} className="mb-2" />
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`flex w-full flex-col items-start rounded-lg px-3 py-2.5 text-left transition-all ${
                  activeSessionId === session.id
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <div className="flex w-full items-center gap-2">
                  {editingSessionId === session.id ? (
                    <input
                      ref={inputRef}
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      onBlur={() => commitRename(session.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          commitRename(session.id);
                        }
                        if (event.key === "Escape") {
                          setEditingSessionId(null);
                          setEditingValue("");
                        }
                      }}
                      className="w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectSession(session.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="text-sm font-medium truncate w-full block">
                        {session.title}
                      </span>
                      <span className="text-[11px] text-zinc-500 truncate w-full mt-0.5 block">
                        {session.lastMessage}
                      </span>
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
                      >
                        <IconDots size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 border-white/10 bg-zinc-900/95 text-zinc-200"
                    >
                      <DropdownMenuItem onClick={() => startRename(session)}>
                        <IconPencil size={14} />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onArchiveSession(session.id)}
                      >
                        <IconArchive size={14} />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteDialogSessionId(session.id)}
                      >
                        <IconTrash size={14} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <AlertDialog
        open={deleteDialogSessionId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogSessionId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteDialogSessionId) {
                  onDeleteSession(deleteDialogSessionId);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
