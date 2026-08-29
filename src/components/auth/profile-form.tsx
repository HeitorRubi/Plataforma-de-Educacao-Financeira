"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/app/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";

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
        <label className="text-sm font-medium" htmlFor="fullName">
          Nome completo
        </label>
        <input
          autoComplete="name"
          className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          defaultValue={fullName}
          id="fullName"
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
          className={state.success ? "text-sm text-emerald-800" : "text-sm text-red-700"}
        >
          {state.message}
        </p>
      )}

      <button
        className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
