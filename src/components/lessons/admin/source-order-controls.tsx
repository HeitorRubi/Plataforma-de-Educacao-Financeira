"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useActionState } from "react";

import { moveSourceAction } from "@/app/admin/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/fontes/actions";
import { initialLessonActionState } from "@/lib/lessons/types";

type SourceOrderControlsProps = {
  courseId: string;
  moduleId: string;
  lessonId: string;
  sourceId: string;
  sourceTitle: string;
  isFirst: boolean;
  isLast: boolean;
};

export function SourceOrderControls({
  courseId,
  moduleId,
  lessonId,
  sourceId,
  sourceTitle,
  isFirst,
  isLast,
}: SourceOrderControlsProps) {
  const action = moveSourceAction.bind(
    null,
    courseId,
    moduleId,
    lessonId,
    sourceId,
  );
  const [state, formAction, pending] = useActionState(
    action,
    initialLessonActionState,
  );

  return (
    <div>
      <form action={formAction} className="flex min-h-9 gap-2">
        <button
          aria-label={`Mover ${sourceTitle} para cima`}
          className="grid size-9 place-items-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isFirst || pending}
          name="direction"
          title="Mover para cima"
          type="submit"
          value="up"
        >
          <ChevronUp aria-hidden="true" size={17} />
        </button>
        <button
          aria-label={`Mover ${sourceTitle} para baixo`}
          className="grid size-9 place-items-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isLast || pending}
          name="direction"
          title="Mover para baixo"
          type="submit"
          value="down"
        >
          <ChevronDown aria-hidden="true" size={17} />
        </button>
      </form>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-2 text-xs ${
            state.success ? "text-emerald-800" : "text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
