"use client";

import { Eye, EyeOff } from "lucide-react";
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
        className={isPublished ? "button-secondary" : "button-primary"}
        disabled={pending}
        type="submit"
      >
        {isPublished ? (
          <EyeOff aria-hidden="true" size={18} />
        ) : (
          <Eye aria-hidden="true" size={18} />
        )}
        {pending
          ? "Salvando..."
          : isPublished
            ? "Despublicar"
            : "Publicar"}
      </button>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-3 ${
            state.success ? "status-message-success" : "status-message-error"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
