import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <span className="font-bold">Plataforma Financeira</span>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link className="text-neutral-700 hover:text-neutral-950" href="/login">
              Entrar
            </Link>
            <Link
              className="rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900"
              href="/cadastro"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-16">
        <div className="max-w-3xl border-l-4 border-emerald-700 pl-6 sm:pl-10">
          <p className="mb-4 text-sm font-semibold text-emerald-800">
            Educação financeira gratuita
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Plataforma de Educação Financeira
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Crie sua conta para acessar o ambiente educacional e acompanhar seu
            perfil na plataforma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center rounded-md bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-900"
              href="/cadastro"
            >
              Começar cadastro
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 hover:border-neutral-400"
              href="/area-autenticada"
            >
              Acessar minha área
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// artur
