import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { LessonForm } from "@/components/lessons/admin/lesson-form";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import { getAdminModule } from "@/lib/modules/queries";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const [user, course, module] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
    getAdminModule(id, moduleId),
  ]);

  if (!course || !module) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <AdminCoursesNav />
        <div className="mt-8 border-b border-neutral-200 pb-7">
          <p className="text-sm font-semibold text-emerald-800">Nova aula</p>
          <h1 className="mt-2 text-3xl font-bold">{module.title}</h1>
          <p className="mt-3 text-sm text-neutral-600">Curso: {course.title}</p>
        </div>

        <section className="pt-8">
          <LessonForm courseId={course.id} moduleId={module.id} />
        </section>
      </main>
    </div>
  );
}
