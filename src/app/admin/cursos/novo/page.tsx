import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CourseForm } from "@/components/courses/admin/course-form";
import { requireAdmin } from "@/lib/courses/queries";

export default async function NewCoursePage() {
  const user = await requireAdmin();
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <AdminCoursesNav />
        <div className="mt-8 border-b border-neutral-200 pb-7">
          <p className="text-sm font-semibold text-emerald-800">Novo curso</p>
          <h1 className="mt-2 text-3xl font-bold">Criar rascunho</h1>
          <p className="mt-3 leading-7 text-neutral-600">
            O curso permanecerá invisível para usuários até ser publicado.
          </p>
        </div>

        <section className="pt-8">
          <CourseForm />
        </section>
      </main>
    </div>
  );
}
