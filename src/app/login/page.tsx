import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusMessages: Record<string, string> = {
  "signed-out": "Sessão encerrada com segurança.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims.sub) {
    redirect("/area-autenticada");
  }

  const { status } = await searchParams;
  const statusMessage = status ? statusMessages[status] : null;

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link className="text-sm font-semibold text-emerald-800" href="/">
          Plataforma Financeira
        </Link>

        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Acesse sua área na plataforma.
          </p>

          {statusMessage && (
            <p
              aria-live="polite"
              className="mt-5 border-l-4 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            >
              {statusMessage}
            </p>
          )}

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Ainda não possui conta?{" "}
            <Link className="font-semibold text-emerald-800 hover:underline" href="/cadastro">
              Cadastre-se
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
