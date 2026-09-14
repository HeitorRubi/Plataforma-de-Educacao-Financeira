import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CourseForm } from "@/components/courses/admin/course-form";
import { requireAdmin } from "@/lib/courses/queries";

export default async function NewCoursePage() {
  const user = await requireAdmin();
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
        <AdminCoursesNav />
        <div className="page-intro mt-8">
          <p className="eyebrow">Novo curso</p>
          <h1 className="page-title">Criar rascunho</h1>
          <p className="page-description">
            O curso permanecerá invisível para usuários até ser publicado.
          </p>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <CourseForm />
        </section>
      </main>
    </div>
  );
}
