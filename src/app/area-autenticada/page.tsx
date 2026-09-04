import Link from "next/link";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { requireUser } from "@/lib/auth/session";

export default async function AuthenticatedAreaPage() {
  const user = await requireUser();
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold text-emerald-800">
          Área autenticada
        </p>
        <h1 className="mt-3 text-3xl font-bold">Olá, {displayName}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
          Sua sessão está ativa. Acesse o catálogo para consultar os cursos
          publicados pela equipe da plataforma.
        </p>

        <dl className="mt-10 grid max-w-3xl border-y border-neutral-200 sm:grid-cols-2">
          <div className="py-5 sm:pr-6">
            <dt className="text-sm text-neutral-500">E-mail</dt>
            <dd className="mt-1 break-words font-medium">{user.email}</dd>
          </div>
          <div className="border-t border-neutral-200 py-5 sm:border-l sm:border-t-0 sm:pl-6">
            <dt className="text-sm text-neutral-500">Perfil de acesso</dt>
            <dd className="mt-1 font-medium">{user.profile.role}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900"
            href="/cursos"
          >
            Ver cursos
          </Link>
          {user.profile.role === "ADMIN" && (
            <Link
              className="inline-flex h-11 items-center rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 transition hover:border-neutral-400"
              href="/admin"
            >
              Abrir administração
            </Link>
          )}
          <Link
            className="inline-flex h-11 items-center px-2 font-semibold text-emerald-800 hover:underline"
            href="/perfil"
          >
            Editar perfil
          </Link>
        </div>
      </main>
    </div>
  );
}
