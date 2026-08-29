"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <input
          autoComplete="email"
          className={inputClassName}
          id="email"
          name="email"
          required
          type="email"
        />
        {state.errors?.email && (
          <p className="mt-2 text-sm text-red-700">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          className={inputClassName}
          id="password"
          name="password"
          required
          type="password"
        />
        {state.errors?.password && (
          <p className="mt-2 text-sm text-red-700">{state.errors.password}</p>
        )}
      </div>

      {state.message && (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        className="h-11 w-full rounded-md bg-emerald-800 px-4 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
