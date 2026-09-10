import "server-only";

import { requireUser } from "@/lib/auth/session";
import type {
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
} from "@/lib/chat-history/types";
import {
  createChatSessionTitle,
  isValidChatSessionId,
} from "@/lib/chat-history/validation";
import { isRagReference } from "@/lib/rag/response-validation";
import type { RagAnswer, RagAnswerStatus } from "@/lib/rag/types";
import { createClient } from "@/lib/supabase/server";

const SESSION_COLUMNS = "id, title, created_at, updated_at";
const MESSAGE_COLUMNS =
  "id, role, content, status, citations, position, created_at";

type ChatSessionRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ChatMessageRow = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  status: RagAnswerStatus | null;
  citations: unknown;
  position: number;
  created_at: string;
};

export class ChatHistoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatHistoryError";
  }
}

function mapSession(row: ChatSessionRow): ChatSessionSummary {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: ChatMessageRow): ChatMessage {
  const references = Array.isArray(row.citations)
    ? row.citations.filter(isRagReference)
    : [];

  return {
    id: row.id,
    role: row.role,
    content: row.content,
    status: row.status,
    references,
    position: row.position,
    createdAt: row.created_at,
  };
}

export async function listChatSessions(): Promise<ChatSessionSummary[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select(SESSION_COLUMNS)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Supabase chat session list error", error);
    throw new ChatHistoryError("Não foi possível carregar as conversas.");
  }

  return ((data ?? []) as ChatSessionRow[]).map(mapSession);
}

export async function chatSessionExists(sessionId: string): Promise<boolean> {
  if (!isValidChatSessionId(sessionId)) {
    return false;
  }

  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Supabase chat session existence error", error);
    throw new ChatHistoryError("Não foi possível localizar a conversa.");
  }

  return Boolean(data);
}

export async function getChatSession(
  sessionId: string,
): Promise<ChatSession | null> {
  if (!isValidChatSessionId(sessionId)) {
    return null;
  }

  const user = await requireUser();
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase
    .from("chat_sessions")
    .select(SESSION_COLUMNS)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError) {
    console.error("Supabase chat session detail error", sessionError);
    throw new ChatHistoryError("Não foi possível carregar a conversa.");
  }

  if (!sessionData) {
    return null;
  }

  const { data: messageData, error: messageError } = await supabase
    .from("chat_messages")
    .select(MESSAGE_COLUMNS)
    .eq("session_id", sessionId)
    .order("position", { ascending: true });

  if (messageError) {
    console.error("Supabase chat message list error", messageError);
    throw new ChatHistoryError("Não foi possível carregar as mensagens.");
  }

  return {
    ...mapSession(sessionData as ChatSessionRow),
    messages: ((messageData ?? []) as ChatMessageRow[]).map(mapMessage),
  };
}

export async function appendChatExchange(
  sessionId: string | null,
  question: string,
  answer: RagAnswer,
): Promise<string | null> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("append_chat_exchange", {
    p_session_id: sessionId,
    p_title: createChatSessionTitle(question),
    p_question: question,
    p_answer: answer.answer,
    p_status: answer.status,
    p_citations: answer.references,
  });

  if (error) {
    console.error("Supabase chat exchange append error", error);
    throw new ChatHistoryError("Não foi possível salvar a conversa.");
  }

  return typeof data === "string" && isValidChatSessionId(data) ? data : null;
}
