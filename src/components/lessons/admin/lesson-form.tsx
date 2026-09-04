"use client";

import { useActionState, useState } from "react";

import {
  createLessonAction,
  updateLessonAction,
} from "@/app/admin/cursos/[id]/modulos/[moduleId]/aulas/actions";
import { MarkdownContent } from "@/components/lessons/markdown-content";
import type { Lesson } from "@/lib/lessons/types";
import { initialLessonFormState } from "@/lib/lessons/types";

type LessonFormProps = {
  courseId: string;
  moduleId: string;
  lesson?: Lesson;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 font-sans text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function LessonForm({ courseId, moduleId, lesson }: LessonFormProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [content, setContent] = useState(lesson?.content ?? "");
  const action = lesson
    ? updateLessonAction.bind(null, courseId, moduleId, lesson.id)
    : createLessonAction.bind(null, courseId, moduleId);
  const [state, formAction, pending] = useActionState(
    action,
    initialLessonFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="text-sm font-medium" htmlFor="title">
          Título
        </label>
        <input
          className={`${fieldClassName} h-11`}
          defaultValue={lesson?.title ?? ""}
          id="title"
          maxLength={120}
          minLength={3}
          name="title"
          required
          type="text"
        />
        {state.errors?.title && (
          <p className="mt-2 text-sm text-red-700">{state.errors.title}</p>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium" htmlFor="content">
            Conteúdo
          </label>
          <div
            aria-label="Modo do conteúdo"
            className="inline-flex rounded-md border border-neutral-300 bg-white p-1"
            role="group"
          >
            <button
              aria-pressed={mode === "edit"}
              className={`h-8 rounded px-3 text-sm font-semibold ${
                mode === "edit"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
              onClick={() => setMode("edit")}
              type="button"
            >
              Editar
            </button>
            <button
              aria-pressed={mode === "preview"}
              className={`h-8 rounded px-3 text-sm font-semibold ${
                mode === "preview"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
              onClick={() => setMode("preview")}
              type="button"
            >
              Visualizar
            </button>
          </div>
        </div>

        <textarea
          className={`${fieldClassName} min-h-96 resize-y py-3 font-mono leading-6`}
          hidden={mode !== "edit"}
          id="content"
          maxLength={100000}
          name="content"
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva o conteúdo da aula"
          rows={18}
          value={content}
        />

        {mode === "preview" && (
          <div className="mt-2 min-h-96 rounded-md border border-neutral-300 bg-white p-6">
            <MarkdownContent content={content} />
          </div>
        )}

        {state.errors?.content && (
          <p className="mt-2 text-sm text-red-700">{state.errors.content}</p>
        )}
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={
            state.success ? "text-sm text-emerald-800" : "text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      )}

      <button
        className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? lesson
            ? "Salvando..."
            : "Criando..."
          : lesson
            ? "Salvar alterações"
            : "Criar aula"}
      </button>
    </form>
  );
}
