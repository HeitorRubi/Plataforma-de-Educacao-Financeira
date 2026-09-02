import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { CourseStatus } from "@/components/courses/course-status";
import { CourseModuleOutline } from "@/components/modules/course-module-outline";
import { requireUser } from "@/lib/auth/session";
import { getPublishedCourse } from "@/lib/courses/queries";
import { listPublishedCourseModules } from "@/lib/modules/queries";

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

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          className="text-sm font-semibold text-emerald-800 hover:underline"
          href="/cursos"
        >
          Voltar para cursos
        </Link>

        <article className="mt-8">
          <CourseStatus isPublished={course.is_published} />
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            {course.title}
          </h1>
          <div className="mt-8 border-y border-neutral-200 py-8">
            <h2 className="text-sm font-semibold text-neutral-500">Descrição</h2>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-8 text-neutral-700">
              {course.description || "Sem descrição."}
            </p>
          </div>

          <CourseModuleOutline modules={modules} />
        </article>
      </main>
    </div>
  );
}
