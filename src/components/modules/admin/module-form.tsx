"use client";

import { useActionState } from "react";

import {
  createModuleAction,
  updateModuleAction,
} from "@/app/admin/cursos/[id]/modulos/actions";
import type { CourseModule } from "@/lib/modules/types";
import { initialModuleFormState } from "@/lib/modules/types";

type ModuleFormProps = {
  courseId: string;
  module?: CourseModule;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 font-sans text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function ModuleForm({ courseId, module }: ModuleFormProps) {
  const action = module
    ? updateModuleAction.bind(null, courseId, module.id)
    : createModuleAction.bind(null, courseId);
  const [state, formAction, pending] = useActionState(
    action,
    initialModuleFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="text-sm font-medium" htmlFor="title">
          Título
        </label>
        <input
          className={`${fieldClassName} h-11`}
          defaultValue={module?.title ?? ""}
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
          className={`${fieldClassName} min-h-36 resize-y py-3 leading-6`}
          defaultValue={module?.description ?? ""}
          id="description"
          maxLength={1000}
          name="description"
          rows={6}
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
          className={
            state.success ? "text-sm text-emerald-800" : "text-sm text-red-700"
          }
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
          ? module
            ? "Salvando..."
            : "Criando..."
          : module
            ? "Salvar alterações"
            : "Criar módulo"}
      </button>
    </form>
  );
}
