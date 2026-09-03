import Link from "next/link";

export default function LessonNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold text-emerald-800">Conteúdo</p>
      <h1 className="mt-3 text-3xl font-bold">Aula não encontrada</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        A aula não existe ou ainda não está publicada.
      </p>
      <Link
        className="mt-8 inline-flex font-semibold text-emerald-800 hover:underline"
        href="/cursos"
      >
        Voltar para cursos
      </Link>
    </main>
  );
}
