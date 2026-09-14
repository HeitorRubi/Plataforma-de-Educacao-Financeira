import { BookOpen, Database, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";

export function AdminCoursesNav() {
  return (
    <nav
      aria-label="Administração de cursos"
      className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-2"
    >
      <Link
        className="button-ghost shrink-0"
        href="/admin"
      >
        <LayoutDashboard aria-hidden="true" size={16} />
        Visão geral
      </Link>
      <Link
        className="button-ghost shrink-0"
        href="/admin/cursos"
      >
        <BookOpen aria-hidden="true" size={16} />
        Todos os cursos
      </Link>
      <Link
        className="button-ghost shrink-0"
        href="/admin/cursos/novo"
      >
        <Plus aria-hidden="true" size={16} />
        Criar curso
      </Link>
      <Link
        className="button-ghost shrink-0"
        href="/admin/base-conhecimento"
      >
        <Database aria-hidden="true" size={16} />
        Base de conhecimento
      </Link>
    </nav>
  );
}
