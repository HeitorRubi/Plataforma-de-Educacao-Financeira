import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function LessonNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
      <div className="content-panel p-8">
      <SearchX aria-hidden="true" className="text-neutral-500" size={28} />
      <p className="eyebrow mt-5">Conteúdo</p>
      <h1 className="mt-3 text-3xl font-bold">Aula não encontrada</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        A aula não existe ou ainda não está publicada.
      </p>
      <Link
        className="text-link mt-8"
        href="/cursos"
      >
        <ArrowLeft aria-hidden="true" size={16} /> Voltar para cursos
      </Link>
      </div>
    </main>
  );
}
