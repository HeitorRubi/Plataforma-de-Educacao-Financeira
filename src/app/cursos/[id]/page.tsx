import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { CourseStatus } from "@/components/courses/course-status";
import { CourseModuleOutline } from "@/components/modules/course-module-outline";
import { CourseProgressSummary } from "@/components/progress/course-progress-summary";
import { requireUser } from "@/lib/auth/session";
import { getPublishedCourse } from "@/lib/courses/queries";
import { listPublishedLessonsForModules } from "@/lib/lessons/queries";
import { listPublishedCourseModules } from "@/lib/modules/queries";
import {
  calculateCourseProgress,
  listUserLessonProgress,
} from "@/lib/progress/queries";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, course, modules] = await Promise.all([
    requireUser(),
    getPublishedCourse(id),
    listPublishedCourseModules(id),
  ]);

  if (!course) {
    notFound();
  }

  const lessons = await listPublishedLessonsForModules(
    modules.map((module) => module.id),
  );
  const lessonProgress = await listUserLessonProgress(
    lessons.map((lesson) => lesson.id),
  );
  const completedLessonIds = lessonProgress.map((item) => item.lesson_id);
  const courseProgress = calculateCourseProgress(
    lessons.map((lesson) => lesson.id),
    lessonProgress,
  );
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
        <Link
          className="text-link text-sm"
          href="/cursos"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Voltar para cursos
        </Link>

        <article className="mt-8">
          <CourseStatus isPublished={course.is_published} />
          <h1 className="page-title mt-4">
            {course.title}
          </h1>
          <div className="content-panel mt-8 p-6 sm:p-8">
            <h2 className="text-sm font-semibold text-neutral-500">Descrição</h2>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-8 text-neutral-700">
              {course.description || "Sem descrição."}
            </p>
          </div>

          <CourseProgressSummary progress={courseProgress} />

          <CourseModuleOutline
            completedLessonIds={completedLessonIds}
            courseId={course.id}
            lessons={lessons}
            modules={modules}
          />
        </article>
      </main>
    </div>
  );
}
