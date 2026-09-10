import { NextResponse } from "next/server";

import {
  RagConfigurationError,
  RagProviderError,
} from "@/lib/rag/groq";
import {
  appendChatExchange,
  ChatHistoryError,
  chatSessionExists,
  getChatSession,
} from "@/lib/chat-history/queries";
import { isValidChatSessionId } from "@/lib/chat-history/validation";
import { answerKnowledgeQuestion } from "@/lib/rag/service";
import {
  MAX_CHAT_REQUEST_LENGTH,
  validateQuestion,
} from "@/lib/rag/validation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

async function hasAuthenticatedSession(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims.sub);
}

export async function POST(request: Request) {
  if (!(await hasAuthenticatedSession())) {
    return jsonResponse({ error: "Autenticação necessária." }, 401);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Envie a pergunta em formato JSON." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_CHAT_REQUEST_LENGTH
  ) {
    return jsonResponse({ error: "A requisição excede o limite permitido." }, 413);
  }

  let payload: unknown;

  try {
    const rawBody = await request.text();

    if (rawBody.length > MAX_CHAT_REQUEST_LENGTH) {
      return jsonResponse({ error: "A requisição excede o limite permitido." }, 413);
    }

    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "O corpo da requisição não é um JSON válido." }, 400);
  }

  const questionValue =
    typeof payload === "object" && payload !== null && "question" in payload
      ? payload.question
      : undefined;
  const sessionIdValue =
    typeof payload === "object" && payload !== null && "sessionId" in payload
      ? payload.sessionId
      : undefined;
  const validation = validateQuestion(questionValue);

  if (!validation.success) {
    return jsonResponse({ error: validation.message }, 400);
  }

  if (
    sessionIdValue !== undefined &&
    sessionIdValue !== null &&
    !isValidChatSessionId(sessionIdValue)
  ) {
    return jsonResponse({ error: "A conversa informada é inválida." }, 400);
  }

  const sessionId = isValidChatSessionId(sessionIdValue)
    ? sessionIdValue
    : null;

  try {
    if (sessionId && !(await chatSessionExists(sessionId))) {
      return jsonResponse({ error: "Conversa não encontrada." }, 404);
    }

    const answer = await answerKnowledgeQuestion(validation.question);
    const persistedSessionId = await appendChatExchange(
      sessionId,
      validation.question,
      answer,
    );

    if (!persistedSessionId) {
      return jsonResponse({ error: "Conversa não encontrada." }, 404);
    }

    const session = await getChatSession(persistedSessionId);

    if (!session) {
      throw new ChatHistoryError("A conversa salva não pôde ser carregada.");
    }

    return jsonResponse({ ...answer, session });
  } catch (error) {
    if (error instanceof ChatHistoryError) {
      console.error("Chat history request error", error.message);
      return jsonResponse(
        { error: "Não foi possível salvar ou carregar a conversa." },
        500,
      );
    }

    if (error instanceof RagConfigurationError) {
      console.error("RAG configuration error", error.message);
      return jsonResponse(
        { error: "O assistente ainda não está configurado no servidor." },
        503,
      );
    }

    if (error instanceof RagProviderError) {
      console.error(
        "RAG provider error",
        JSON.stringify({
          code: error.providerCode,
          name: error.providerErrorName,
          requestId: error.providerRequestId,
          status: error.providerStatus,
        }),
      );
      return jsonResponse(
        { error: "O assistente está temporariamente indisponível." },
        502,
      );
    }

    console.error("RAG request error", error);
    return jsonResponse(
      { error: "Não foi possível consultar a base de conhecimento." },
      500,
    );
  }
}
