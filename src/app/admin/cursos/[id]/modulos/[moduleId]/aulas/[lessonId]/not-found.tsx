import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function AdminLessonNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
      <div className="content-panel p-8">
      <SearchX aria-hidden="true" className="text-neutral-500" size={28} />
      <p className="eyebrow mt-5">Administração</p>
      <h1 className="mt-3 text-3xl font-bold">Aula não encontrada</h1>
      <Link
        className="text-link mt-8"
        href="/admin/cursos"
      >
        <ArrowLeft aria-hidden="true" size={16} /> Voltar para cursos
      </Link>
      </div>
    </main>
  );
}
