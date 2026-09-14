import {
  ArrowRight,
  BookOpen,
  MessageSquareText,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { requireUser } from "@/lib/auth/session";

export default async function AuthenticatedAreaPage() {
  const user = await requireUser();
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="page-container">
        <p className="eyebrow">
          Área autenticada
        </p>
        <h1 className="page-title">Olá, {displayName}</h1>
        <p className="page-description">
          Sua sessão está ativa. Acesse os cursos publicados e consulte o
          assistente educacional da plataforma.
        </p>

        <section className="mt-9 grid gap-4 md:grid-cols-2">
          <Link
            className="group content-panel flex min-h-44 flex-col p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            href="/cursos"
          >
            <span className="grid size-10 place-items-center rounded-md bg-emerald-50 text-emerald-800">
              <BookOpen aria-hidden="true" size={21} />
            </span>
            <h2 className="mt-5 text-lg font-bold">Explorar cursos</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Acesse os conteúdos publicados e acompanhe seu progresso.
            </p>
            <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-emerald-800">
              Ver catálogo
              <ArrowRight
                aria-hidden="true"
                className="transition group-hover:translate-x-1"
                size={16}
              />
            </span>
          </Link>
          <Link
            className="group content-panel flex min-h-44 flex-col p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            href="/chat"
          >
            <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-blue-700">
              <MessageSquareText aria-hidden="true" size={21} />
            </span>
            <h2 className="mt-5 text-lg font-bold">Consultar assistente</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Faça perguntas e confira as fontes utilizadas nas respostas.
            </p>
            <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-blue-700">
              Abrir conversas
              <ArrowRight
                aria-hidden="true"
                className="transition group-hover:translate-x-1"
                size={16}
              />
            </span>
          </Link>
        </section>

        <dl className="content-panel mt-6 grid overflow-hidden sm:grid-cols-2">
          <div className="p-5 sm:border-r sm:border-neutral-200">
            <dt className="text-sm text-neutral-500">E-mail</dt>
            <dd className="mt-1 break-words font-medium">{user.email}</dd>
          </div>
          <div className="border-t border-neutral-200 p-5 sm:border-t-0">
            <dt className="text-sm text-neutral-500">Perfil de acesso</dt>
            <dd className="mt-1 flex items-center gap-2 font-medium">
              <ShieldCheck
                aria-hidden="true"
                className="text-emerald-700"
                size={17}
              />
              {user.profile.role}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {user.profile.role === "ADMIN" && (
            <Link
              className="button-secondary"
              href="/admin"
            >
              <Settings aria-hidden="true" size={17} />
              Abrir administração
            </Link>
          )}
          <Link
            className="button-ghost"
            href="/perfil"
          >
            Editar perfil
          </Link>
        </div>
      </main>
    </div>
  );
}
