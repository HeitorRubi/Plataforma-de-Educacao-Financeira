"use client";

import { Eye, EyeOff } from "lucide-react";
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
            ? "button-secondary"
            : "button-primary"
        }
        disabled={pending}
        type="submit"
      >
        {isPublished ? (
          <EyeOff aria-hidden="true" size={18} />
        ) : (
          <Eye aria-hidden="true" size={18} />
        )}
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
          className={`mt-3 ${state.success ? "status-message-success" : "status-message-error"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
