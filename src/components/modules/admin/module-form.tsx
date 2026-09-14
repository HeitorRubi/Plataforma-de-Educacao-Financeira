"use client";

import { Save } from "lucide-react";
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
  "field-control";

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
        <label className="form-label" htmlFor="title">
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
        <label className="form-label" htmlFor="description">
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
            state.success ? "status-message-success" : "status-message-error"
          }
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
