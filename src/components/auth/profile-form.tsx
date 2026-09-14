"use client";

import { Save } from "lucide-react";
import { useActionState } from "react";

import { updateProfileAction } from "@/app/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";
import {
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_MIN_LENGTH,
} from "@/lib/auth/validation";

type ProfileFormProps = {
  fullName: string;
};

export function ProfileForm({ fullName }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="form-label" htmlFor="fullName">
          Nome completo
        </label>
        <input
          autoComplete="name"
          className="field-control h-11"
          defaultValue={fullName}
          id="fullName"
          maxLength={FULL_NAME_MAX_LENGTH}
          minLength={FULL_NAME_MIN_LENGTH}
          name="fullName"
          required
          type="text"
        />
        {state.errors?.fullName && (
          <p className="mt-2 text-sm text-red-700">{state.errors.fullName}</p>
        )}
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={state.success ? "status-message-success" : "status-message-error"}
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
        {pending ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
