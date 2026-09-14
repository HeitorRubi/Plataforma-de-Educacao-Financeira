import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { SourceForm } from "@/components/lessons/admin/source-form";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import { getAdminLesson } from "@/lib/lessons/queries";
import { getAdminModule } from "@/lib/modules/queries";

export default async function NewSourcePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}) {
  const { id, moduleId, lessonId } = await params;
  const [user, course, module, lesson] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
    getAdminModule(id, moduleId),
    getAdminLesson(moduleId, lessonId),
  ]);

  if (!course || !module || !lesson) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />
        <div className="page-intro mt-8">
          <p className="eyebrow">Nova fonte</p>
          <h1 className="page-title">{lesson.title}</h1>
          <p className="mt-3 text-sm text-neutral-600">
            {course.title} · {module.title}
          </p>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <SourceForm
            courseId={course.id}
            lessonId={lesson.id}
            moduleId={module.id}
          />
        </section>
      </main>
    </div>
  );
}
