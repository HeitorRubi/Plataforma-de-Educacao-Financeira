import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims.sub) {
    redirect("/area-autenticada");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link className="text-sm font-semibold text-emerald-800" href="/">
          Plataforma Financeira
        </Link>

        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Cadastre-se gratuitamente para acessar a plataforma.
          </p>

          <div className="mt-6">
            <SignupForm />
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Já possui conta?{" "}
            <Link className="font-semibold text-emerald-800 hover:underline" href="/login">
              Entrar
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
