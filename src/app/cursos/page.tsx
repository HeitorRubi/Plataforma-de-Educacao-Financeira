import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { CourseStatus } from "@/components/courses/course-status";
import { requireUser } from "@/lib/auth/session";
import { listPublishedCourses } from "@/lib/courses/queries";

export default async function CoursesPage() {
  const [user, courses] = await Promise.all([
    requireUser(),
    listPublishedCourses(),
  ]);
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="page-container">
        <div className="page-intro max-w-3xl">
          <p className="eyebrow">Catálogo</p>
          <h1 className="page-title">Cursos disponíveis</h1>
          <p className="page-description">
            Consulte os cursos publicados pela equipe da plataforma.
          </p>
        </div>

        {courses.length === 0 ? (
          <section className="content-panel mt-8 p-8 text-center">
            <BookOpen
              aria-hidden="true"
              className="mx-auto text-neutral-400"
              size={28}
            />
            <h2 className="text-lg font-semibold">Nenhum curso publicado</h2>
            <p className="mt-2 text-neutral-600">
              O catálogo ainda não possui cursos disponíveis.
            </p>
          </section>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {courses.map((course) => (
              <article
                className="group content-panel flex min-h-64 flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                key={course.id}
              >
                <span
                  aria-hidden="true"
                  className="-mx-6 -mt-6 mb-6 h-1 bg-emerald-700"
                />
                <CourseStatus isPublished={course.is_published} />
                <h2 className="mt-4 text-xl font-bold leading-7">{course.title}</h2>
                <p className="mt-3 line-clamp-4 leading-7 text-neutral-600">
                  {course.description || "Sem descrição."}
                </p>
                <Link
                  className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-emerald-800"
                  href={`/cursos/${course.id}`}
                >
                  Consultar curso
                  <ArrowRight
                    aria-hidden="true"
                    className="transition group-hover:translate-x-1"
                    size={16}
                  />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
