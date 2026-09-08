import Link from "next/link";

export function AdminCoursesNav() {
  return (
    <nav aria-label="Administração de cursos" className="flex flex-wrap gap-3">
      <Link
        className="text-sm font-semibold text-emerald-800 hover:underline"
        href="/admin"
      >
        Visão geral
      </Link>
      <Link
        className="text-sm font-semibold text-emerald-800 hover:underline"
        href="/admin/cursos"
      >
        Todos os cursos
      </Link>
      <Link
        className="text-sm font-semibold text-emerald-800 hover:underline"
        href="/admin/cursos/novo"
      >
        Criar curso
      </Link>
      <Link
        className="text-sm font-semibold text-emerald-800 hover:underline"
        href="/admin/base-conhecimento"
      >
        Base de conhecimento
      </Link>
    </nav>
  );
}
