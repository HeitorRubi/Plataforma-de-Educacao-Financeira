"use client";

import { useActionState } from "react";

import { setLessonPublicationAction } from "@/app/admin/cursos/[id]/modulos/[moduleId]/aulas/actions";
import { initialLessonActionState } from "@/lib/lessons/types";

type LessonPublicationFormProps = {
  courseId: string;
  moduleId: string;
  lessonId: string;
  isPublished: boolean;
};

export function LessonPublicationForm({
  courseId,
  moduleId,
  lessonId,
  isPublished,
}: LessonPublicationFormProps) {
  const action = setLessonPublicationAction.bind(
    null,
    courseId,
    moduleId,
    lessonId,
    !isPublished,
  );
  const [state, formAction, pending] = useActionState(
    action,
    initialLessonActionState,
  );

  return (
    <form action={formAction}>
      <button
        className="h-11 rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Salvando..."
          : isPublished
            ? "Despublicar"
            : "Publicar"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${
            state.success ? "text-emerald-800" : "text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
