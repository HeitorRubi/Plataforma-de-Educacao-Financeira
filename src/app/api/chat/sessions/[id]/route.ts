import { NextResponse } from "next/server";

import {
  ChatHistoryError,
  getChatSession,
} from "@/lib/chat-history/queries";
import { isValidChatSessionId } from "@/lib/chat-history/validation";
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

export async function GET(
  _request: Request,
  context: RouteContext<"/api/chat/sessions/[id]">,
) {
  if (!(await hasAuthenticatedSession())) {
    return jsonResponse({ error: "Autenticação necessária." }, 401);
  }

  const { id } = await context.params;

  if (!isValidChatSessionId(id)) {
    return jsonResponse({ error: "A conversa informada é inválida." }, 400);
  }

  try {
    const session = await getChatSession(id);

    if (!session) {
      return jsonResponse({ error: "Conversa não encontrada." }, 404);
    }

    return jsonResponse({ session });
  } catch (error) {
    if (error instanceof ChatHistoryError) {
      console.error("Chat history detail request error", error.message);
      return jsonResponse(
        { error: "Não foi possível carregar a conversa." },
        500,
      );
    }

    console.error("Chat history detail error", error);
    return jsonResponse({ error: "Não foi possível carregar a conversa." }, 500);
  }
}
