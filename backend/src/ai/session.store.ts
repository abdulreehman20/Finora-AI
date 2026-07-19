import { randomUUID } from "crypto";

export type SessionRole = "user" | "assistant";

export interface SessionMessage {
  role: SessionRole;
  content: string;
  createdAt: string;
}

interface SessionState {
  messages: SessionMessage[];
  updatedAt: number;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const sessions = new Map<string, SessionState>();

function clearExpiredSessions() {
  const now = Date.now();
  for (const [key, state] of sessions) {
    if (now - state.updatedAt > SESSION_TTL_MS) {
      sessions.delete(key);
    }
  }
}

export function ensureSession(sessionId?: string) {
  clearExpiredSessions();
  const id =
    sessionId && sessionId.trim().length > 0 ? sessionId : randomUUID();
  if (!sessions.has(id)) {
    sessions.set(id, { messages: [], updatedAt: Date.now() });
  }
  return id;
}

export function getSessionMessages(sessionId: string) {
  clearExpiredSessions();
  return sessions.get(sessionId)?.messages ?? [];
}

export function appendSessionMessage(
  sessionId: string,
  message: Omit<SessionMessage, "createdAt">,
) {
  const state = sessions.get(sessionId);
  if (!state) return;

  state.messages.push({
    ...message,
    createdAt: new Date().toISOString(),
  });
  state.updatedAt = Date.now();
}

export function deleteSession(sessionId: string) {
  return sessions.delete(sessionId);
}
