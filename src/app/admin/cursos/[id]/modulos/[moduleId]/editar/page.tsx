import { notFound } from "next/navigation";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { ModuleForm } from "@/components/modules/admin/module-form";
import { getAdminCourse, requireAdmin } from "@/lib/courses/queries";
import { getAdminModule } from "@/lib/modules/queries";

export default async function EditModulePage({
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
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />
        <div className="page-intro mt-8">
          <p className="eyebrow">Editar módulo</p>
          <h1 className="page-title">{module.title}</h1>
          <p className="mt-3 text-sm text-neutral-600">Curso: {course.title}</p>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <ModuleForm courseId={course.id} module={module} />
        </section>
      </main>
    </div>
  );
}
