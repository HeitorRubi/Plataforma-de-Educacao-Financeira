"use client";

import { Save } from "lucide-react";
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
  "field-control";

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
        <label className="form-label" htmlFor="title">
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
        <label className="form-label" htmlFor="author">
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
          <label className="form-label" htmlFor="url">
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
          <label className="form-label" htmlFor="publicationYear">
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
            state.success ? "status-message-success" : "status-message-error"
          }
        >
          {state.message}
        </p>
      )}

      <button
        className="button-primary"
        disabled={pending}
        type="submit"
      >
        <Save aria-hidden="true" size={18} />
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
