"use client";

import { useActionState } from "react";

import {
  createSourceAction,
  updateSourceAction,
} from "@/app/admin/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/fontes/actions";
import type { LessonSource } from "@/lib/lessons/types";
import { initialSourceFormState } from "@/lib/lessons/types";

type SourceFormProps = {
  courseId: string;
  moduleId: string;
  lessonId: string;
  source?: LessonSource;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 font-sans text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function SourceForm({
  courseId,
  moduleId,
  lessonId,
  source,
}: SourceFormProps) {
  const action = source
    ? updateSourceAction.bind(
        null,
        courseId,
        moduleId,
        lessonId,
        source.id,
      )
    : createSourceAction.bind(null, courseId, moduleId, lessonId);
  const [state, formAction, pending] = useActionState(
    action,
    initialSourceFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="text-sm font-medium" htmlFor="title">
          Título da fonte
        </label>
        <input
          className={`${fieldClassName} h-11`}
          defaultValue={source?.title ?? ""}
          id="title"
          maxLength={200}
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
        <label className="text-sm font-medium" htmlFor="author">
          Autor
        </label>
        <input
          className={`${fieldClassName} h-11`}
          defaultValue={source?.author ?? ""}
          id="author"
          maxLength={200}
          name="author"
          type="text"
        />
        {state.errors?.author && (
          <p className="mt-2 text-sm text-red-700">{state.errors.author}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <div>
          <label className="text-sm font-medium" htmlFor="url">
            URL
          </label>
          <input
            className={`${fieldClassName} h-11`}
            defaultValue={source?.url ?? ""}
            id="url"
            maxLength={2000}
            name="url"
            type="url"
          />
          {state.errors?.url && (
            <p className="mt-2 text-sm text-red-700">{state.errors.url}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="publicationYear">
            Ano
          </label>
          <input
            className={`${fieldClassName} h-11`}
            defaultValue={source?.publication_year ?? ""}
            id="publicationYear"
            inputMode="numeric"
            max="9999"
            min="1000"
            name="publicationYear"
            type="number"
          />
          {state.errors?.publicationYear && (
            <p className="mt-2 text-sm text-red-700">
              {state.errors.publicationYear}
            </p>
          )}
        </div>
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
          ? source
            ? "Salvando..."
            : "Adicionando..."
          : source
            ? "Salvar alterações"
            : "Adicionar fonte"}
      </button>
    </form>
  );
}
