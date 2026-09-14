import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CourseForm } from "@/components/courses/admin/course-form";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, course] = await Promise.all([
    requireAdmin(),
    getAdminCourse(id),
  ]);

  if (!course) {
    notFound();
  }

  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />
        <div className="page-intro mt-8">
          <p className="eyebrow">Editar curso</p>
          <h1 className="page-title">{course.title}</h1>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <CourseForm course={course} />
        </section>
      </main>
    </div>
  );
}
