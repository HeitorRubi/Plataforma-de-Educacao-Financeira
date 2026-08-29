import Link from "next/link";

import { logoutAction } from "@/app/auth/actions";
import type { UserRole } from "@/lib/auth/session";

type AuthenticatedHeaderProps = {
  fullName: string;
  role: UserRole;
};

export function AuthenticatedHeader({
  fullName,
  role,
}: AuthenticatedHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link className="font-bold text-neutral-950" href="/area-autenticada">
          Plataforma Financeira
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-neutral-600 sm:inline">
            {fullName} · {role}
          </span>
          <Link className="font-medium text-emerald-800 hover:underline" href="/perfil">
            Perfil
          </Link>
          <form action={logoutAction}>
            <button
              className="font-medium text-neutral-700 hover:text-neutral-950 hover:underline"
              type="submit"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
