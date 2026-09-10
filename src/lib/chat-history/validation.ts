import type {
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
  PersistedChatAnswer,
} from "@/lib/chat-history/types";
import { isRagAnswer, isRagReference } from "@/lib/rag/response-validation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_TITLE_LENGTH = 72;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isValidChatSessionId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function createChatSessionTitle(question: string): string {
  const normalized = question.replace(/\s+/g, " ").trim();

  if (normalized.length <= SESSION_TITLE_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, SESSION_TITLE_LENGTH - 3).trimEnd()}...`;
}

export function isChatSessionSummary(
  value: unknown,
): value is ChatSessionSummary {
  return (
    isRecord(value) &&
    isValidChatSessionId(value.id) &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (
    !isRecord(value) ||
    !Array.isArray(value.references) ||
    !value.references.every(isRagReference)
  ) {
    return false;
  }

  const hasValidRoleData =
    (value.role === "USER" &&
      value.status === null &&
      value.references.length === 0) ||
    (value.role === "ASSISTANT" &&
      (value.status === "answered" ||
        value.status === "insufficient_context" ||
        value.status === "restricted"));

  return (
    isValidChatSessionId(value.id) &&
    hasValidRoleData &&
    typeof value.content === "string" &&
    value.content.trim().length > 0 &&
    typeof value.position === "number" &&
    Number.isInteger(value.position) &&
    value.position > 0 &&
    typeof value.createdAt === "string"
  );
}

export function isChatSession(value: unknown): value is ChatSession {
  if (!isRecord(value) || !Array.isArray(value.messages)) {
    return false;
  }

  const messages = value.messages;

  return (
    isChatSessionSummary(value) &&
    messages.every(isChatMessage)
  );
}

export function isPersistedChatAnswer(
  value: unknown,
): value is PersistedChatAnswer {
  if (!isRecord(value)) {
    return false;
  }

  const session = value.session;

  return isRagAnswer(value) && isChatSession(session);
}
