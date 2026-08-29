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
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-neutral-200 pb-7">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Administração</p>
            <h1 className="mt-2 text-3xl font-bold">Cursos</h1>
          </div>
          <Link
            className="inline-flex h-11 items-center rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900"
            href="/admin/cursos/novo"
          >
            Criar curso
          </Link>
        </div>

        <div className="mt-6">
          <AdminCoursesNav />
        </div>

        {courses.length === 0 ? (
          <section className="mt-10 border-y border-neutral-200 py-10">
            <h2 className="text-lg font-semibold">Nenhum curso cadastrado</h2>
            <p className="mt-2 text-neutral-600">
              Crie o primeiro curso para iniciar a organização do catálogo.
            </p>
          </section>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <article
                className="flex min-h-56 flex-col rounded-md border border-neutral-200 bg-white p-6"
                key={course.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold leading-7">{course.title}</h2>
                  <CourseStatus isPublished={course.is_published} />
                </div>
                <p className="mt-4 line-clamp-3 leading-7 text-neutral-600">
                  {course.description || "Sem descrição."}
                </p>
                <div className="mt-auto flex flex-wrap gap-4 pt-6 text-sm font-semibold">
                  <Link
                    className="text-emerald-800 hover:underline"
                    href={`/admin/cursos/${course.id}`}
                  >
                    Consultar
                  </Link>
                  <Link
                    className="text-neutral-700 hover:text-neutral-950 hover:underline"
                    href={`/admin/cursos/${course.id}/editar`}
                  >
                    Editar
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
