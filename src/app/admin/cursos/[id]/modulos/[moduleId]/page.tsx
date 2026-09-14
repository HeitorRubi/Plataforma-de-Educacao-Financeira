import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { AdminLessonList } from "@/components/lessons/admin/admin-lesson-list";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import { listAdminLessons } from "@/lib/lessons/queries";
import { getAdminModule } from "@/lib/modules/queries";

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const [user, course, module, lessons] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
    getAdminModule(id, moduleId),
    listAdminLessons(moduleId),
  ]);

  if (!course || !module) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />

        <div className="page-intro mt-8">
          <Link
            className="text-link text-sm"
            href={`/admin/cursos/${course.id}`}
          >
            <ArrowLeft aria-hidden="true" size={16} /> Voltar para o curso
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="eyebrow">
                Módulo {module.position}
              </p>
              <h1 className="page-title">
                {module.title}
              </h1>
              {module.description && (
                <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-600">
                  {module.description}
                </p>
              )}
            </div>
            <Link
              className="button-secondary"
              href={`/admin/cursos/${course.id}/modulos/${module.id}/editar`}
            >
              <Pencil aria-hidden="true" size={17} /> Editar módulo
            </Link>
          </div>
          <p className="mt-5 text-sm text-neutral-500">Curso: {course.title}</p>
        </div>

        <AdminLessonList
          courseId={course.id}
          lessons={lessons}
          moduleId={module.id}
        />
      </main>
    </div>
  );
}
