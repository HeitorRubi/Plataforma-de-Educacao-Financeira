import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CourseStatus } from "@/components/courses/course-status";
import { listAdminCourses, requireAdmin } from "@/lib/courses/queries";

export default async function AdminCoursesPage() {
  const [user, courses] = await Promise.all([
    requireAdmin(),
    listAdminCourses(),
  ]);
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="page-container">
        <div className="page-intro flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Administração</p>
            <h1 className="page-title">Cursos</h1>
          </div>
          <Link
            className="button-primary"
            href="/admin/cursos/novo"
          >
            <Plus aria-hidden="true" size={18} /> Criar curso
          </Link>
        </div>

        <div className="mt-6">
          <AdminCoursesNav />
        </div>

        {courses.length === 0 ? (
          <section className="content-panel mt-8 p-8">
            <h2 className="text-lg font-semibold">Nenhum curso cadastrado</h2>
            <p className="mt-2 text-neutral-600">
              Crie o primeiro curso para iniciar a organização do catálogo.
            </p>
          </section>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <article
                className="content-panel flex min-h-56 flex-col p-6 transition hover:border-emerald-300 hover:shadow-md"
                key={course.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold leading-7">{course.title}</h2>
                  <CourseStatus isPublished={course.is_published} />
                </div>
                <p className="mt-4 line-clamp-3 leading-7 text-neutral-600">
                  {course.description || "Sem descrição."}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6 text-sm font-semibold">
                  <Link
                    className="button-ghost h-9 px-2"
                    href={`/admin/cursos/${course.id}`}
                  >
                    <Eye aria-hidden="true" size={16} /> Consultar
                  </Link>
                  <Link
                    className="button-ghost h-9 px-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                    href={`/admin/cursos/${course.id}/editar`}
                  >
                    <Pencil aria-hidden="true" size={15} /> Editar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
