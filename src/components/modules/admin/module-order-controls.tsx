"use client";

import { useActionState } from "react";

import { moveModuleAction } from "@/app/admin/cursos/[id]/modulos/actions";
import { initialModuleOrderState } from "@/lib/modules/types";

type ModuleOrderControlsProps = {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  isFirst: boolean;
  isLast: boolean;
};

export function ModuleOrderControls({
  courseId,
  moduleId,
  moduleTitle,
  isFirst,
  isLast,
}: ModuleOrderControlsProps) {
  const action = moveModuleAction.bind(null, courseId, moduleId);
  const [state, formAction, pending] = useActionState(
    action,
    initialModuleOrderState,
  );

  return (
    <div>
      <form action={formAction} className="flex min-h-9 gap-2">
        <button
          aria-label={`Mover ${moduleTitle} para cima`}
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isFirst || pending}
          name="direction"
          title="Mover para cima"
          type="submit"
          value="up"
        >
          Subir
        </button>
        <button
          aria-label={`Mover ${moduleTitle} para baixo`}
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isLast || pending}
          name="direction"
          title="Mover para baixo"
          type="submit"
          value="down"
        >
          Descer
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
