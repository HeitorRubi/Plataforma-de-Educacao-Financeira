import Link from "next/link";

export default function AdminLessonNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold text-emerald-800">Administração</p>
      <h1 className="mt-3 text-3xl font-bold">Aula não encontrada</h1>
      <Link
        className="mt-8 inline-flex font-semibold text-emerald-800 hover:underline"
        href="/admin/cursos"
      >
        Voltar para cursos
      </Link>
    </main>
  );
}
