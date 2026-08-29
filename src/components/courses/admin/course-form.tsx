"use client";

import { useActionState } from "react";

import {
  createCourseAction,
  updateCourseAction,
} from "@/app/admin/cursos/actions";
import type { Course } from "@/lib/courses/types";
import { initialCourseFormState } from "@/lib/courses/types";

type CourseFormProps = {
  course?: Course;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 font-sans text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function CourseForm({ course }: CourseFormProps) {
  const action = course
    ? updateCourseAction.bind(null, course.id)
    : createCourseAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialCourseFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="text-sm font-medium" htmlFor="title">
          Título
        </label>
        <input
          className={`${fieldClassName} h-11`}
          defaultValue={course?.title ?? ""}
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
        <label className="text-sm font-medium" htmlFor="description">
          Descrição
        </label>
        <textarea
          className={`${fieldClassName} min-h-40 resize-y py-3 leading-6`}
          defaultValue={course?.description ?? ""}
          id="description"
          maxLength={1000}
          name="description"
          rows={7}
        />
        {state.errors?.description && (
          <p className="mt-2 text-sm text-red-700">
            {state.errors.description}
          </p>
        )}
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={state.success ? "text-sm text-emerald-800" : "text-sm text-red-700"}
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
          ? course
            ? "Salvando..."
            : "Criando..."
          : course
            ? "Salvar alterações"
            : "Criar rascunho"}
      </button>
    </form>
  );
}
