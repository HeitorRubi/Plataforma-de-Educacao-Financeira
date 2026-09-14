"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function CoursesError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
      <div className="content-panel p-8">
      <AlertTriangle aria-hidden="true" className="text-red-700" size={28} />
      <p className="eyebrow mt-5 text-red-700">Erro ao carregar</p>
      <h1 className="mt-3 text-3xl font-bold">Os cursos não estão disponíveis</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        Não foi possível consultar o catálogo neste momento.
      </p>
      <button
        className="button-primary mt-8"
        onClick={reset}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={17} /> Tentar novamente
      </button>
      </div>
    </main>
  );
}
