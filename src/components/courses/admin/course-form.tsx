"use client";

import { Save } from "lucide-react";
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
  "field-control";

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
        <label className="form-label" htmlFor="title">
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
        <label className="form-label" htmlFor="description">
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
          className={state.success ? "status-message-success" : "status-message-error"}
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
