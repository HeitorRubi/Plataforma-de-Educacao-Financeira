"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { MarkdownContent } from "@/components/lessons/markdown-content";
import type {
  RagAnswer,
  RagAnswerStatus,
  RagReference,
} from "@/lib/rag/types";
import {
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
} from "@/lib/rag/validation";

const statusContent: Record<
  RagAnswerStatus,
  { label: string; className: string }
> = {
  answered: {
    label: "Resposta fundamentada",
    className: "text-emerald-800",
  },
  insufficient_context: {
    label: "Contexto insuficiente",
    className: "text-amber-800",
  },
  restricted: {
    label: "Solicitação limitada",
    className: "text-amber-800",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isReference(value: unknown): value is RagReference {
  if (!isRecord(value) || !Array.isArray(value.sources)) {
    return false;
  }

  const validSources = value.sources.every(
    (source) =>
      isRecord(source) &&
      typeof source.id === "string" &&
      typeof source.title === "string" &&
      isNullableString(source.author) &&
      isNullableString(source.url) &&
      (source.publicationYear === null ||
        typeof source.publicationYear === "number") &&
      typeof source.position === "number",
  );

  return (
    validSources &&
    typeof value.citationNumber === "number" &&
    typeof value.chunkId === "string" &&
    typeof value.chunkPosition === "number" &&
    typeof value.courseId === "string" &&
    typeof value.courseTitle === "string" &&
    typeof value.moduleId === "string" &&
    typeof value.moduleTitle === "string" &&
    typeof value.lessonId === "string" &&
    typeof value.lessonTitle === "string" &&
    typeof value.lessonUrl === "string"
  );
}

function isRagAnswer(value: unknown): value is RagAnswer {
  if (!isRecord(value) || !Array.isArray(value.references)) {
    return false;
  }

  return (
    typeof value.answer === "string" &&
    (value.status === "answered" ||
      value.status === "insufficient_context" ||
      value.status === "restricted") &&
    value.references.every(isReference)
  );
}

function getApiError(payload: unknown, status: number): string {
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }

  if (status === 401) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  return "Não foi possível consultar o assistente. Tente novamente.";
}

function ReferenceItem({ reference }: { reference: RagReference }) {
  return (
    <article className="grid gap-4 border-t border-neutral-200 py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
      <span className="font-semibold text-emerald-800">
        [{reference.citationNumber}]
      </span>

      <div className="min-w-0 break-words">
        <h4 className="font-semibold text-neutral-950">
          {reference.lessonTitle}
        </h4>
        <p className="mt-1 text-sm leading-6 text-neutral-600">
          {reference.courseTitle} · {reference.moduleTitle} · Trecho {reference.chunkPosition}
        </p>

        {reference.sources.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase text-neutral-500">
              Fontes da aula
            </p>
            <ul className="mt-2 space-y-2 text-sm text-neutral-700">
              {reference.sources.map((source) => {
                const details = [source.author, source.publicationYear]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li key={source.id}>
                    {source.url ? (
                      <a
                        className="font-medium text-emerald-800 hover:underline"
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {source.title}
                      </a>
                    ) : (
                      <span className="font-medium">{source.title}</span>
                    )}
                    {details && <span className="text-neutral-500"> · {details}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Link
        className="text-sm font-semibold text-emerald-800 hover:underline sm:pt-0.5"
        href={reference.lessonUrl}
      >
        Abrir aula
      </Link>
    </article>
  );
}

export function ChatInterface() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [result, setResult] = useState<RagAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setResult(null);
    setSubmittedQuestion(normalizedQuestion);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: normalizedQuestion }),
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(getApiError(payload, response.status));
        return;
      }

      if (!isRagAnswer(payload)) {
        setError("O assistente retornou uma resposta inválida. Tente novamente.");
        return;
      }

      setResult(payload);
    } catch {
      setError("Não foi possível conectar ao assistente. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentStatus = result ? statusContent[result.status] : null;

  return (
    <section className="mt-8" aria-labelledby="chat-question-title">
      <div className="border-b border-neutral-200 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold" id="chat-question-title">
            Nova pergunta
          </h2>
          <span className="text-sm font-medium text-neutral-500">
            Base de cursos publicados
          </span>
        </div>

        <form className="mt-5" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold" htmlFor="chat-question">
            Sua pergunta
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-neutral-300 bg-white px-4 py-3 leading-7 outline-none transition placeholder:text-neutral-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            disabled={isSubmitting}
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

          <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">
              {question.length}/{MAX_QUESTION_LENGTH} caracteres
            </span>
            <button
              className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || question.trim().length < MIN_QUESTION_LENGTH}
              type="submit"
            >
              {isSubmitting ? "Consultando..." : "Enviar pergunta"}
            </button>
          </div>
        </form>
      </div>

      <div
        aria-busy={isSubmitting}
        aria-live="polite"
        className="min-h-40 py-8"
      >
        {isSubmitting && (
          <div className="border-l-4 border-emerald-700 pl-5">
            <p className="font-semibold">Consultando a base publicada...</p>
            <p className="mt-2 text-sm text-neutral-500">
              A resposta pode levar alguns segundos.
            </p>
          </div>
        )}

        {!isSubmitting && error && (
          <div className="border-l-4 border-red-700 bg-red-50 px-5 py-4 text-red-900">
            <p className="font-semibold">Não foi possível concluir a consulta</p>
            <p className="mt-1 leading-6">{error}</p>
          </div>
        )}

        {!isSubmitting && !error && !result && (
          <p className="text-neutral-500">Nenhuma consulta realizada nesta sessão.</p>
        )}

        {!isSubmitting && result && currentStatus && (
          <div>
            <div className="border-l-4 border-neutral-300 pl-5">
              <p className="text-xs font-semibold uppercase text-neutral-500">
                Pergunta
              </p>
              <p className="mt-2 break-words text-lg leading-7 text-neutral-800">
                {submittedQuestion}
              </p>
            </div>

            <article className="mt-8 border-y border-neutral-200 py-7">
              <p className={`text-sm font-semibold ${currentStatus.className}`}>
                {currentStatus.label}
              </p>
              <div className="mt-3 break-words">
                <MarkdownContent content={result.answer} />
              </div>
            </article>

            {result.references.length > 0 && (
              <section className="mt-8" aria-labelledby="chat-references-title">
                <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
                  <div>
                    <h3 className="text-xl font-bold" id="chat-references-title">
                      Referências utilizadas
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Trechos e fontes relacionados à resposta.
                    </p>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {result.references.length}{" "}
                    {result.references.length === 1 ? "referência" : "referências"}
                  </span>
                </div>

                <div className="border-b border-neutral-200">
                  {result.references.map((reference) => (
                    <ReferenceItem
                      key={`${reference.chunkId}:${reference.citationNumber}`}
                      reference={reference}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
