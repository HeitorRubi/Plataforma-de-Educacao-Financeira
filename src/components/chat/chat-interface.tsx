"use client";

import { type FormEvent, useState } from "react";

import { ChatMessage } from "@/components/chat/chat-message";
import type {
  ChatSession,
  ChatSessionSummary,
} from "@/lib/chat-history/types";
import {
  isChatSession,
  isPersistedChatAnswer,
} from "@/lib/chat-history/validation";
import {
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
} from "@/lib/rag/validation";

type ChatInterfaceProps = {
  initialSessions: ChatSessionSummary[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiError(payload: unknown, status: number): string {
  if (status === 401) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }

  return "Não foi possível consultar o assistente. Tente novamente.";
}

function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function toSessionSummary(session: ChatSession): ChatSessionSummary {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function ChatInterface({ initialSessions }: ChatInterfaceProps) {
  const [sessions, setSessions] =
    useState<ChatSessionSummary[]>(initialSessions);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const isBusy = isSubmitting || loadingSessionId !== null;

  function handleNewSession() {
    if (isBusy) {
      return;
    }

    setActiveSession(null);
    setQuestion("");
    setError(null);
  }

  async function handleSelectSession(sessionId: string) {
    if (isBusy || activeSession?.id === sessionId) {
      return;
    }

    setError(null);
    setLoadingSessionId(sessionId);

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(getApiError(payload, response.status));
        return;
      }

      if (!isRecord(payload) || !isChatSession(payload.session)) {
        setError("O histórico retornado é inválido. Tente novamente.");
        return;
      }

      setActiveSession(payload.session);
      setQuestion("");
    } catch {
      setError("Não foi possível carregar a conversa. Verifique sua conexão.");
    } finally {
      setLoadingSessionId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuestion = question.trim();

    if (normalizedQuestion.length < MIN_QUESTION_LENGTH) {
      setError(
        `A pergunta deve possuir ao menos ${MIN_QUESTION_LENGTH} caracteres.`,
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: normalizedQuestion,
          sessionId: activeSession?.id ?? null,
        }),
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(getApiError(payload, response.status));
        return;
      }

      if (!isPersistedChatAnswer(payload)) {
        setError("O assistente retornou uma resposta inválida. Tente novamente.");
        return;
      }

      const summary = toSessionSummary(payload.session);

      setActiveSession(payload.session);
      setSessions((current) => [
        summary,
        ...current.filter((session) => session.id !== summary.id),
      ]);
      setQuestion("");
    } catch {
      setError("Não foi possível conectar ao assistente. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-8 grid overflow-hidden border-y border-neutral-200 bg-white lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border-b border-neutral-200 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Conversas</h2>
          <button
            className="text-sm font-semibold text-emerald-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isBusy}
            onClick={handleNewSession}
            type="button"
          >
            Nova conversa
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="mt-6 text-sm leading-6 text-neutral-500">
            Nenhuma conversa salva.
          </p>
        ) : (
          <nav aria-label="Histórico de conversas" className="mt-4">
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-1 lg:max-h-[36rem]">
              {sessions.map((session) => {
                const isActive = activeSession?.id === session.id;
                const isLoading = loadingSessionId === session.id;

                return (
                  <li key={session.id}>
                    <button
                      aria-current={isActive ? "page" : undefined}
                      className={`w-full rounded-md px-3 py-3 text-left transition disabled:cursor-wait ${
                        isActive
                          ? "bg-emerald-50 text-emerald-950"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                      disabled={isBusy}
                      onClick={() => handleSelectSession(session.id)}
                      type="button"
                    >
                      <span className="block truncate text-sm font-semibold">
                        {session.title}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {isLoading
                          ? "Carregando..."
                          : formatSessionDate(session.updatedAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </aside>

      <div className="min-w-0">
        <header className="border-b border-neutral-200 px-5 py-4 sm:px-7">
          <p className="text-xs font-semibold uppercase text-emerald-800">
            {activeSession ? "Conversa salva" : "Nova conversa"}
          </p>
          <h2 className="mt-1 break-words text-lg font-bold">
            {activeSession?.title ?? "Assistente educacional"}
          </h2>
        </header>

        <div
          aria-busy={isBusy}
          aria-live="polite"
          className="min-h-80 px-5 py-7 sm:px-7"
        >
          {loadingSessionId && (
            <div className="border-l-4 border-emerald-700 pl-5">
              <p className="font-semibold">Carregando conversa...</p>
            </div>
          )}

          {!loadingSessionId && !activeSession && !isSubmitting && (
            <p className="text-neutral-500">Nova conversa pronta.</p>
          )}

          {!loadingSessionId && activeSession && (
            <div className="space-y-8">
              {activeSession.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}

          {isSubmitting && (
            <div className="mt-8 border-l-4 border-emerald-700 pl-5">
              <p className="font-semibold">Consultando a base publicada...</p>
              <p className="mt-2 text-sm text-neutral-500">
                A resposta será adicionada a esta conversa.
              </p>
            </div>
          )}
        </div>

        <form
          className="border-t border-neutral-200 px-5 py-6 sm:px-7"
          onSubmit={handleSubmit}
        >
          <label className="text-sm font-semibold" htmlFor="chat-question">
            Sua pergunta
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-neutral-300 bg-white px-4 py-3 leading-7 outline-none transition placeholder:text-neutral-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:bg-neutral-100"
            disabled={isBusy}
            id="chat-question"
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(event) => {
              setQuestion(event.target.value);
              setError(null);
            }}
            placeholder="Ex.: O que é explicado sobre renda variável?"
            required
            value={question}
          />

          {error && (
            <p
              aria-live="assertive"
              className="mt-3 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">
              {question.length}/{MAX_QUESTION_LENGTH} caracteres
            </span>
            <button
              className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                isBusy || question.trim().length < MIN_QUESTION_LENGTH
              }
              type="submit"
            >
              {isSubmitting ? "Consultando..." : "Enviar pergunta"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
