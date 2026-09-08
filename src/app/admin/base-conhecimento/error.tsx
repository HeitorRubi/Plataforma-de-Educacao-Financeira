"use client";

export default function KnowledgeBaseError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold text-red-700">Erro ao carregar</p>
      <h1 className="mt-3 text-3xl font-bold">
        A base de conhecimento não está disponível
      </h1>
      <p className="mt-4 leading-7 text-neutral-600">
        Não foi possível consultar o conteúdo publicado neste momento.
      </p>
      <button
        className="mt-8 h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900"
        onClick={reset}
        type="button"
      >
        Tentar novamente
      </button>
    </main>
  );
}
