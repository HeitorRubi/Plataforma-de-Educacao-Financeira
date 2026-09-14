"use client";

import {
  History,
  LoaderCircle,
  MessageSquarePlus,
  MessagesSquare,
  Send,
} from "lucide-react";
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
    <section className="content-panel mt-8 grid min-h-[38rem] overflow-hidden lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="border-b border-neutral-200 bg-neutral-50 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-bold">
            <History aria-hidden="true" size={17} /> Conversas
          </h2>
          <button
            aria-label="Iniciar nova conversa"
            className="grid size-9 place-items-center rounded-md text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isBusy}
            onClick={handleNewSession}
            title="Nova conversa"
            type="button"
          >
            <MessageSquarePlus aria-hidden="true" size={19} />
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
                          ? "bg-emerald-100 text-emerald-950"
                          : "text-neutral-700 hover:bg-white"
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
          <p className="eyebrow">
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
            <div className="flex items-center gap-3 text-neutral-600">
              <LoaderCircle aria-hidden="true" className="animate-spin text-emerald-700" size={20} />
              <p className="font-semibold">Carregando conversa...</p>
            </div>
          )}

          {!loadingSessionId && !activeSession && !isSubmitting && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-neutral-500">
              <span className="grid size-12 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                <MessagesSquare aria-hidden="true" size={24} />
              </span>
              <p className="mt-4 font-semibold text-neutral-700">Nova conversa</p>
              <p className="mt-1 max-w-sm text-sm leading-6">Envie uma pergunta sobre os conteúdos disponíveis na plataforma.</p>
            </div>
          )}

          {!loadingSessionId && activeSession && (
            <div className="space-y-8">
              {activeSession.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}

          {isSubmitting && (
            <div className="mt-8 flex items-start gap-3 rounded-md bg-emerald-50 p-4">
              <LoaderCircle aria-hidden="true" className="mt-0.5 animate-spin text-emerald-700" size={19} />
              <div>
              <p className="font-semibold">Consultando a base publicada...</p>
              <p className="mt-2 text-sm text-neutral-500">
                A resposta será adicionada a esta conversa.
              </p>
              </div>
            </div>
          )}
        </div>

        <form
          className="border-t border-neutral-200 px-5 py-6 sm:px-7"
          onSubmit={handleSubmit}
        >
          <label className="form-label" htmlFor="chat-question">
            Sua pergunta
          </label>
          <textarea
            className="field-control min-h-28 resize-y px-4 py-3 leading-7"
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
              className="status-message-error mt-3"
            >
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">
              {question.length}/{MAX_QUESTION_LENGTH} caracteres
            </span>
            <button
              className="button-primary"
              disabled={
                isBusy || question.trim().length < MIN_QUESTION_LENGTH
              }
              type="submit"
            >
              <Send aria-hidden="true" size={17} />
              {isSubmitting ? "Consultando..." : "Enviar pergunta"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
