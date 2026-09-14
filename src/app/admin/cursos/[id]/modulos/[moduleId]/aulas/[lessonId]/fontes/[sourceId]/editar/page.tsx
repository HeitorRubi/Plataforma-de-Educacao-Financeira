import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { SourceForm } from "@/components/lessons/admin/source-form";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import {
  getAdminLesson,
  getAdminLessonSource,
} from "@/lib/lessons/queries";
import { getAdminModule } from "@/lib/modules/queries";

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
    sourceId: string;
  }>;
}) {
  const { id, moduleId, lessonId, sourceId } = await params;
  const [user, course, module, lesson, source] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
    getAdminModule(id, moduleId),
    getAdminLesson(moduleId, lessonId),
    getAdminLessonSource(lessonId, sourceId),
  ]);

  if (!course || !module || !lesson || !source) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />
        <div className="page-intro mt-8">
          <p className="eyebrow">Editar fonte</p>
          <h1 className="page-title">{source.title}</h1>
          <p className="mt-3 text-sm text-neutral-600">Aula: {lesson.title}</p>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <SourceForm
            courseId={course.id}
            lessonId={lesson.id}
            moduleId={module.id}
            source={source}
          />
        </section>
      </main>
    </div>
  );
}
