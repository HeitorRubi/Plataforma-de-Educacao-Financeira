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
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <AdminCoursesNav />

        <div className="mt-8 border-b border-neutral-200 pb-8">
          <Link
            className="text-sm font-semibold text-emerald-800 hover:underline"
            href={`/admin/cursos/${course.id}`}
          >
            Voltar para o curso
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-emerald-800">
                Módulo {module.position}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">
                {module.title}
              </h1>
              {module.description && (
                <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-600">
                  {module.description}
                </p>
              )}
            </div>
            <Link
              className="inline-flex h-11 items-center rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 transition hover:border-neutral-400"
              href={`/admin/cursos/${course.id}/modulos/${module.id}/editar`}
            >
              Editar módulo
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
