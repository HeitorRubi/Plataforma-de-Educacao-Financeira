import { ArrowRight, BookOpenCheck, MessageSquareText, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/brand";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
          <Brand compact />
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link className="button-ghost text-neutral-700" href="/login">
              Entrar
            </Link>
            <Link
              className="button-primary h-10 px-4"
              href="/cadastro"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-emerald-950 text-white">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase text-emerald-300">
                Educação financeira gratuita
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
                Plataforma de Educação Financeira
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/80">
                Aprenda com cursos organizados, acompanhe sua evolução e tire
                dúvidas usando apenas o conteúdo publicado nas aulas.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="button-primary border-white bg-white text-emerald-950 hover:border-emerald-50 hover:bg-emerald-50" href="/cadastro">
                  Começar cadastro
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <Link className="button-secondary border-emerald-700 bg-transparent text-white hover:border-emerald-500 hover:bg-emerald-900" href="/area-autenticada">
                  Acessar minha área
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Recursos da plataforma" className="border-b border-neutral-200 bg-white">
          <div className="mx-auto grid max-w-6xl divide-y divide-neutral-200 px-5 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="py-7 md:pr-8">
              <BookOpenCheck className="text-emerald-700" aria-hidden="true" size={24} />
              <h2 className="mt-4 font-bold">Conteúdo estruturado</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Cursos, módulos e aulas em uma sequência clara de estudo.</p>
            </div>
            <div className="py-7 md:px-8">
              <TrendingUp className="text-blue-700" aria-hidden="true" size={24} />
              <h2 className="mt-4 font-bold">Progresso registrado</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Conclusões salvas para você retomar de onde parou.</p>
            </div>
            <div className="py-7 md:pl-8">
              <MessageSquareText className="text-amber-700" aria-hidden="true" size={24} />
              <h2 className="mt-4 font-bold">Assistente com fontes</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Respostas fundamentadas nos materiais publicados.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
