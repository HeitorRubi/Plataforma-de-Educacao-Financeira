import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { AdminSourceList } from "@/components/lessons/admin/admin-source-list";
import { LessonPublicationForm } from "@/components/lessons/admin/lesson-publication-form";
import { LessonStatus } from "@/components/lessons/lesson-status";
import { MarkdownContent } from "@/components/lessons/markdown-content";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import {
  getAdminLesson,
  listAdminLessonSources,
} from "@/lib/lessons/queries";
import { getAdminModule } from "@/lib/modules/queries";

export default async function AdminLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}) {
  const { id, moduleId, lessonId } = await params;
  const [user, course, module, lesson, sources] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
    getAdminModule(id, moduleId),
    getAdminLesson(moduleId, lessonId),
    listAdminLessonSources(lessonId),
  ]);

  if (!course || !module || !lesson) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";
  const basePath = `/admin/cursos/${course.id}/modulos/${module.id}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <AdminCoursesNav />

        <div className="mt-8 border-b border-neutral-200 pb-8">
          <Link
            className="text-sm font-semibold text-emerald-800 hover:underline"
            href={basePath}
          >
            Voltar para o módulo
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <LessonStatus isPublished={lesson.is_published} />
              <p className="mt-4 text-sm font-semibold text-emerald-800">
                Aula {lesson.position}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">
                {lesson.title}
              </h1>
            </div>
            <Link
              className="inline-flex h-11 items-center rounded-md border border-neutral-300 bg-white px-5 font-semibold text-neutral-800 transition hover:border-neutral-400"
              href={`${basePath}/aulas/${lesson.id}/editar`}
            >
              Editar aula
            </Link>
          </div>
          <p className="mt-5 text-sm text-neutral-500">
            {course.title} · {module.title}
          </p>
        </div>

        <section className="border-b border-neutral-200 py-8">
          <h2 className="text-sm font-semibold text-neutral-500">
            Pré-visualização do conteúdo
          </h2>
          <div className="mt-5">
            <MarkdownContent content={lesson.content} />
          </div>
        </section>

        <AdminSourceList
          courseId={course.id}
          lessonId={lesson.id}
          moduleId={module.id}
          sources={sources}
        />

        <section className="py-8">
          <h2 className="text-lg font-semibold">Publicação</h2>
          <p className="mb-5 mt-2 leading-7 text-neutral-600">
            {lesson.is_published
              ? "A aula está disponível para usuários no curso publicado."
              : "A aula está visível somente na administração."}
          </p>
          <LessonPublicationForm
            courseId={course.id}
            isPublished={lesson.is_published}
            lessonId={lesson.id}
            moduleId={module.id}
          />
        </section>
      </main>
    </div>
  );
}
