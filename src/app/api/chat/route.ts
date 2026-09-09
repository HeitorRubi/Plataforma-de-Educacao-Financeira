import { NextResponse } from "next/server";

import {
  RagConfigurationError,
  RagProviderError,
} from "@/lib/rag/groq";
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
  const validation = validateQuestion(questionValue);

  if (!validation.success) {
    return jsonResponse({ error: validation.message }, 400);
  }

  try {
    return jsonResponse(await answerKnowledgeQuestion(validation.question));
  } catch (error) {
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
