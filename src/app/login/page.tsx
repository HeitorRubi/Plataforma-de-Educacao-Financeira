import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
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
    <main className="grid min-h-screen bg-neutral-50 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(30rem,1.2fr)]">
      <aside className="hidden bg-emerald-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Brand href="/" inverse />
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase text-emerald-300">Ambiente de aprendizagem</p>
          <p className="mt-4 text-3xl font-bold leading-tight">Continue sua jornada de educação financeira.</p>
          <p className="mt-4 leading-7 text-emerald-50/75">Seus cursos, progresso e conversas ficam disponíveis em uma única conta.</p>
        </div>
      </aside>

      <div className="flex items-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden"><Brand href="/" /></div>

          <section className="content-panel mt-8 p-6 sm:p-8 lg:mt-0">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Acesse sua área na plataforma.
          </p>

          {statusMessage && (
            <p
              aria-live="polite"
              className="status-message-success mt-5"
            >
              {statusMessage}
            </p>
          )}

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Ainda não possui conta?{" "}
            <Link className="text-link" href="/cadastro">
              Cadastre-se
            </Link>
          </p>
          </section>
        </div>
      </div>
    </main>
  );
}
