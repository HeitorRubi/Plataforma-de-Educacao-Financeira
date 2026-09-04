"use client";

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
    <section className="border-t border-neutral-200 py-8">
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
              className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending ? "Concluindo..." : "Concluir aula"}
            </button>
          </form>
        )}
      </div>

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
    </section>
  );
}
