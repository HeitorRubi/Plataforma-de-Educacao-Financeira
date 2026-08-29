import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CoursePublicationForm } from "@/components/courses/admin/course-publication-form";
import { CourseStatus } from "@/components/courses/course-status";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, course] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
  ]);

  if (!course) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <AdminCoursesNav />

        <div className="mt-8 border-b border-neutral-200 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <CourseStatus isPublished={course.is_published} />
              <h1 className="mt-4 text-3xl font-bold leading-tight">
                {course.title}
              </h1>
            </div>
            <Link
              className="inline-flex h-11 items-center rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 transition hover:border-neutral-400"
              href={`/admin/cursos/${course.id}/editar`}
            >
              Editar curso
            </Link>
          </div>
        </div>

        <section className="border-b border-neutral-200 py-8">
          <h2 className="text-sm font-semibold text-neutral-500">Descrição</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-700">
            {course.description || "Sem descrição."}
          </p>
        </section>

        <dl className="grid border-b border-neutral-200 sm:grid-cols-2">
          <div className="py-6 sm:pr-6">
            <dt className="text-sm text-neutral-500">Criado em</dt>
            <dd className="mt-1 font-medium">
              {dateFormatter.format(new Date(course.created_at))}
            </dd>
          </div>
          <div className="border-t border-neutral-200 py-6 sm:border-l sm:border-t-0 sm:pl-6">
            <dt className="text-sm text-neutral-500">Última atualização</dt>
            <dd className="mt-1 font-medium">
              {dateFormatter.format(new Date(course.updated_at))}
            </dd>
          </div>
        </dl>

        <section className="py-8">
          <h2 className="text-lg font-semibold">Publicação</h2>
          <p className="mb-5 mt-2 leading-7 text-neutral-600">
            {course.is_published
              ? "O curso está disponível no catálogo dos usuários."
              : "O curso está visível somente na administração."}
          </p>
          <CoursePublicationForm
            courseId={course.id}
            isPublished={course.is_published}
          />
        </section>
      </main>
    </div>
  );
}
