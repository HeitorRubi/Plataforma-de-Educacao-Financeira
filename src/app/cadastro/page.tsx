import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims.sub) {
    redirect("/area-autenticada");
  }

  return (
    <main className="grid min-h-screen bg-neutral-50 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(30rem,1.2fr)]">
      <aside className="hidden bg-emerald-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Brand href="/" inverse />
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase text-emerald-300">Acesso gratuito</p>
          <p className="mt-4 text-3xl font-bold leading-tight">Organize seu aprendizado em um só lugar.</p>
          <p className="mt-4 leading-7 text-emerald-50/75">Crie sua conta para acessar cursos publicados e o assistente educacional.</p>
        </div>
      </aside>

      <div className="flex items-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden"><Brand href="/" /></div>

          <section className="content-panel mt-8 p-6 sm:p-8 lg:mt-0">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Cadastre-se gratuitamente para acessar a plataforma.
          </p>

          <div className="mt-6">
            <SignupForm />
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Já possui conta?{" "}
            <Link className="text-link" href="/login">
              Entrar
            </Link>
          </p>
          </section>
        </div>
      </div>
    </main>
  );
}
