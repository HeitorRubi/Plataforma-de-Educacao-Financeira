import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { logoutAction } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
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
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Brand compact href="/area-autenticada" />

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-1 overflow-x-auto py-2 text-sm"
        >
          <Link className="button-ghost shrink-0" href="/cursos">
            <BookOpen aria-hidden="true" size={17} />
            <span className="hidden sm:inline">Cursos</span>
          </Link>
          <Link className="button-ghost shrink-0" href="/chat">
            <MessageSquareText aria-hidden="true" size={17} />
            <span className="hidden sm:inline">Assistente</span>
          </Link>
          {role === "ADMIN" && (
            <Link
              className="button-ghost shrink-0"
              href="/admin"
            >
              <LayoutDashboard aria-hidden="true" size={17} />
              <span className="hidden lg:inline">Administração</span>
            </Link>
          )}
          <Link className="button-ghost shrink-0" href="/perfil">
            <UserRound aria-hidden="true" size={17} />
            <span className="hidden sm:inline">{fullName}</span>
          </Link>
          <form action={logoutAction}>
            <button
              aria-label={`Sair da conta ${fullName}`}
              className="grid size-10 place-items-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
              title="Sair"
              type="submit"
            >
              <LogOut aria-hidden="true" size={18} />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
