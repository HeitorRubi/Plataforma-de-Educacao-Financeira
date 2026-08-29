"use client";

import { useActionState } from "react";

import { setCoursePublicationAction } from "@/app/admin/cursos/actions";
import { initialCourseFormState } from "@/lib/courses/types";

type CoursePublicationFormProps = {
  courseId: string;
  isPublished: boolean;
};

export function CoursePublicationForm({
  courseId,
  isPublished,
}: CoursePublicationFormProps) {
  const action = setCoursePublicationAction.bind(
    null,
    courseId,
    !isPublished,
  );
  const [state, formAction, pending] = useActionState(
    action,
    initialCourseFormState,
  );

  return (
    <form action={formAction}>
      <button
        className={
          isPublished
            ? "h-11 rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
            : "h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        }
        disabled={pending}
        type="submit"
      >
        {pending
          ? isPublished
            ? "Despublicando..."
            : "Publicando..."
          : isPublished
            ? "Despublicar"
            : "Publicar"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${state.success ? "text-emerald-800" : "text-red-700"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
