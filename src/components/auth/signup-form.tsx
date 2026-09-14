"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";

import { signupAction } from "@/app/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";
import {
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_MIN_LENGTH,
} from "@/lib/auth/validation";

const inputClassName =
  "field-control h-11";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
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
          className={inputClassName}
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
          autoComplete="new-password"
          className={inputClassName}
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        {state.errors?.password && (
          <p className="mt-2 text-sm text-red-700">{state.errors.password}</p>
        )}
      </div>

      <div>
        <label className="form-label" htmlFor="confirmPassword">
          Confirmar senha
        </label>
        <input
          autoComplete="new-password"
          className={inputClassName}
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
        {state.errors?.confirmPassword && (
          <p className="mt-2 text-sm text-red-700">
            {state.errors.confirmPassword}
          </p>
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
        <UserPlus aria-hidden="true" size={18} />
        {pending ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
