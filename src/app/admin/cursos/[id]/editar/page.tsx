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
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <AdminCoursesNav />
        <div className="mt-8 border-b border-neutral-200 pb-7">
          <p className="text-sm font-semibold text-emerald-800">Editar curso</p>
          <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
        </div>

        <section className="pt-8">
          <CourseForm course={course} />
        </section>
      </main>
    </div>
  );
}
