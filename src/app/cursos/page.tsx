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
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="max-w-3xl border-b border-neutral-200 pb-8">
          <p className="text-sm font-semibold text-emerald-800">Catálogo</p>
          <h1 className="mt-2 text-3xl font-bold">Cursos disponíveis</h1>
          <p className="mt-3 leading-7 text-neutral-600">
            Consulte os cursos publicados pela equipe da plataforma.
          </p>
        </div>

        {courses.length === 0 ? (
          <section className="mt-10 border-y border-neutral-200 py-10">
            <h2 className="text-lg font-semibold">Nenhum curso publicado</h2>
            <p className="mt-2 text-neutral-600">
              O catálogo ainda não possui cursos disponíveis.
            </p>
          </section>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {courses.map((course) => (
              <article
                className="flex min-h-64 flex-col rounded-md border border-neutral-200 bg-white p-6"
                key={course.id}
              >
                <CourseStatus isPublished={course.is_published} />
                <h2 className="mt-4 text-xl font-bold leading-7">{course.title}</h2>
                <p className="mt-3 line-clamp-4 leading-7 text-neutral-600">
                  {course.description || "Sem descrição."}
                </p>
                <Link
                  className="mt-auto pt-6 text-sm font-semibold text-emerald-800 hover:underline"
                  href={`/cursos/${course.id}`}
                >
                  Consultar curso
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
