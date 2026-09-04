import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { LessonSources } from "@/components/lessons/lesson-sources";
import { MarkdownContent } from "@/components/lessons/markdown-content";
import { LessonCompletionForm } from "@/components/progress/lesson-completion-form";
import { requireUser } from "@/lib/auth/session";
import { getPublishedCourse } from "@/lib/courses/queries";
import {
  getPublishedLesson,
  listPublishedLessonsForModules,
  listPublishedLessonSources,
} from "@/lib/lessons/queries";
import { listPublishedCourseModules } from "@/lib/modules/queries";
import { listUserLessonProgress } from "@/lib/progress/queries";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}) {
  const { id, moduleId, lessonId } = await params;
  const [user, course, modules, lesson] = await Promise.all([
    requireUser(),
    getPublishedCourse(id),
    listPublishedCourseModules(id),
    getPublishedLesson(moduleId, lessonId),
  ]);
  const courseModule = modules.find((item) => item.id === moduleId);

  if (!course || !courseModule || !lesson) {
    notFound();
  }

  const [lessonSummaries, sources, lessonProgress] = await Promise.all([
    listPublishedLessonsForModules(modules.map((item) => item.id)),
    listPublishedLessonSources(lesson.id),
    listUserLessonProgress([lesson.id]),
  ]);
  const orderedLessons = modules.flatMap((courseModule) =>
    lessonSummaries.filter((item) => item.module_id === courseModule.id),
  );
  const lessonIndex = orderedLessons.findIndex((item) => item.id === lesson.id);
  const previousLesson =
    lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < orderedLessons.length - 1
      ? orderedLessons[lessonIndex + 1]
      : null;
  const courseId = course.id;
  const displayName = user.profile.full_name ?? "Usuário";

  function publicLessonPath(target: { id: string; module_id: string }) {
    return `/cursos/${courseId}/modulos/${target.module_id}/aulas/${target.id}`;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          className="text-sm font-semibold text-emerald-800 hover:underline"
          href={`/cursos/${courseId}`}
        >
          Voltar para o curso
        </Link>

        <article className="mt-8">
          <header className="border-b border-neutral-200 pb-8">
            <p className="text-sm font-semibold text-emerald-800">
              Módulo {courseModule.position} · Aula {lesson.position}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-4 text-neutral-600">
              {course.title} · {courseModule.title}
            </p>
          </header>

          <section className="py-8">
            <MarkdownContent content={lesson.content} />
          </section>

          <LessonSources sources={sources} />

          <LessonCompletionForm
            courseId={courseId}
            isCompleted={lessonProgress.length > 0}
            lessonId={lesson.id}
            moduleId={courseModule.id}
          />
        </article>

        <nav
          aria-label="Navegação entre aulas"
          className="grid gap-4 border-t border-neutral-200 pt-8 sm:grid-cols-2"
        >
          <div>
            {previousLesson && (
              <Link
                className="block border-l-2 border-emerald-700 pl-4 hover:bg-white"
                href={publicLessonPath(previousLesson)}
              >
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Aula anterior
                </span>
                <span className="mt-1 block font-semibold text-emerald-800">
                  {previousLesson.title}
                </span>
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {nextLesson && (
              <Link
                className="block border-r-2 border-emerald-700 pr-4 hover:bg-white"
                href={publicLessonPath(nextLesson)}
              >
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Próxima aula
                </span>
                <span className="mt-1 block font-semibold text-emerald-800">
                  {nextLesson.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </main>
    </div>
  );
}
