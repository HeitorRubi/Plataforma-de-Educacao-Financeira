"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";

import { completeLessonAction } from "@/app/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/actions";
import { initialProgressActionState } from "@/lib/progress/types";

type LessonCompletionFormProps = {
  courseId: string;
  moduleId: string;
  lessonId: string;
  isCompleted: boolean;
};

export function LessonCompletionForm({
  courseId,
  moduleId,
  lessonId,
  isCompleted,
}: LessonCompletionFormProps) {
  const action = completeLessonAction.bind(null, courseId, moduleId, lessonId);
  const [state, formAction, pending] = useActionState(
    action,
    initialProgressActionState,
  );
  const completed = isCompleted || state.success === true;

  return (
    <section className="content-panel my-8 p-6">
      <p className="text-sm font-semibold text-emerald-800">
        Progresso da aula
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <p className="font-semibold text-neutral-900">
          {completed ? "Aula concluída" : "Você ainda não concluiu esta aula."}
        </p>

        {!completed && (
          <form action={formAction}>
            <button
              className="button-primary"
              disabled={pending}
              type="submit"
            >
              <Check aria-hidden="true" size={18} />
              {pending ? "Concluindo..." : "Concluir aula"}
            </button>
          </form>
        )}
      </div>

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
    </section>
  );
}
