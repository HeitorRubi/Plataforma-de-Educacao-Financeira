import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CoursePublicationForm } from "@/components/courses/admin/course-publication-form";
import { CourseStatus } from "@/components/courses/course-status";
import { AdminModuleList } from "@/components/modules/admin/admin-module-list";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import { listAdminModules } from "@/lib/modules/queries";

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
  const [user, course, modules] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
    listAdminModules(id),
  ]);

  if (!course) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />

        <div className="page-intro mt-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <CourseStatus isPublished={course.is_published} />
              <h1 className="page-title mt-4">
                {course.title}
              </h1>
            </div>
            <Link
              className="button-secondary"
              href={`/admin/cursos/${course.id}/editar`}
            >
              <Pencil aria-hidden="true" size={17} /> Editar curso
            </Link>
          </div>
        </div>

        <section className="content-panel mt-8 p-6">
          <h2 className="text-sm font-semibold text-neutral-500">Descrição</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-700">
            {course.description || "Sem descrição."}
          </p>
        </section>

        <dl className="mt-4 grid border-y border-neutral-200 sm:grid-cols-2">
          <div className="py-5 sm:pr-6">
            <dt className="text-sm text-neutral-500">Criado em</dt>
            <dd className="mt-1 font-medium">
              {dateFormatter.format(new Date(course.created_at))}
            </dd>
          </div>
          <div className="border-t border-neutral-200 py-5 sm:border-l sm:border-t-0 sm:pl-6">
            <dt className="text-sm text-neutral-500">Última atualização</dt>
            <dd className="mt-1 font-medium">
              {dateFormatter.format(new Date(course.updated_at))}
            </dd>
          </div>
        </dl>

        <AdminModuleList courseId={course.id} modules={modules} />

        <section className="content-panel mb-8 p-6">
          <h2 className="section-title">Publicação</h2>
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
