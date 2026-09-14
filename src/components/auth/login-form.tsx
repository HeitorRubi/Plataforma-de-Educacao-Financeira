"use client";

import { LogIn } from "lucide-react";
import { useActionState } from "react";

import { loginAction } from "@/app/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";
import { EMAIL_MAX_LENGTH } from "@/lib/auth/validation";

const inputClassName =
  "field-control h-11";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="form-label" htmlFor="email">
          E-mail
        </label>
        <input
          autoComplete="email"
          className={inputClassName}
          id="email"
          maxLength={EMAIL_MAX_LENGTH}
          name="email"
          required
          type="email"
        />
        {state.errors?.email && (
          <p className="mt-2 text-sm text-red-700">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label className="form-label" htmlFor="password">
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
        <p aria-live="polite" className="status-message-error">
          {state.message}
        </p>
      )}

      <button
        className="button-primary w-full"
        disabled={pending}
        type="submit"
      >
        <LogIn aria-hidden="true" size={18} />
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
