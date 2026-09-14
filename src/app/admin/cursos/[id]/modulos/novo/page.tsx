import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { ModuleForm } from "@/components/modules/admin/module-form";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";

export default async function NewModulePage({
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
          <p className="eyebrow">Novo módulo</p>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-description">
            O novo módulo será adicionado ao final da ordem atual.
          </p>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <ModuleForm courseId={course.id} />
        </section>
      </main>
    </div>
  );
}
