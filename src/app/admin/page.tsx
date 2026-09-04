import Link from "next/link";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { CourseStatus } from "@/components/courses/course-status";
import { getAdminOverview } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/courses/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminPage() {
  const [user, overview] = await Promise.all([
    requireAdmin(),
    getAdminOverview(),
  ]);
  const displayName = user.profile.full_name ?? "Usuário";
  const summaryItems = [
    { label: "Cursos", value: overview.totals.courses },
    {
      label: "Cursos publicados",
      value: overview.totals.publishedCourses,
    },
    { label: "Módulos", value: overview.totals.modules },
    {
      label: "Aulas publicadas",
      value: `${overview.totals.publishedLessons}/${overview.totals.lessons}`,
    },
    { label: "Fontes", value: overview.totals.sources },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-neutral-200 pb-7">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Administração
            </p>
            <h1 className="mt-2 text-3xl font-bold">Painel de conteúdo</h1>
            <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
              Acompanhe a estrutura publicada e acesse o gerenciamento de cada
              curso.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900"
            href="/admin/cursos/novo"
          >
            Criar curso
          </Link>
        </div>

        <div className="mt-6">
          <AdminCoursesNav />
        </div>

        <dl className="mt-8 grid grid-cols-2 border-y border-neutral-200 sm:grid-cols-3 lg:grid-cols-5">
          {summaryItems.map((item, index) => (
            <div
              className={`py-5 ${
                index > 0 ? "border-l border-neutral-200 pl-5" : "pr-5"
              }`}
              key={item.label}
            >
              <dt className="text-sm text-neutral-500">{item.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-neutral-950">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <h2 className="text-xl font-bold">Conteúdo por curso</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Módulos, aulas e fontes são gerenciados dentro de cada curso.
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-emerald-800 hover:underline"
              href="/admin/cursos"
            >
              Ver todos os cursos
            </Link>
          </div>

          {overview.courses.length === 0 ? (
            <div className="border-b border-neutral-200 py-10">
              <h3 className="font-semibold">Nenhum curso cadastrado</h3>
              <p className="mt-2 text-neutral-600">
                Crie um curso para iniciar a estrutura de conteúdo.
              </p>
            </div>
          ) : (
            <div>
              {overview.courses.map((course) => (
                <article
                  className="grid gap-5 border-b border-neutral-200 py-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
                  key={course.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold leading-7">
                        {course.title}
                      </h3>
                      <CourseStatus isPublished={course.isPublished} />
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      Atualizado em {dateFormatter.format(new Date(course.updatedAt))}
                    </p>
                  </div>

                  <dl className="grid grid-cols-3 gap-5 text-sm">
                    <div>
                      <dt className="text-neutral-500">Módulos</dt>
                      <dd className="mt-1 font-semibold">{course.moduleCount}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Aulas</dt>
                      <dd className="mt-1 font-semibold">{course.lessonCount}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Fontes</dt>
                      <dd className="mt-1 font-semibold">{course.sourceCount}</dd>
                    </div>
                  </dl>

                  <Link
                    className="text-sm font-semibold text-emerald-800 hover:underline md:text-right"
                    href={`/admin/cursos/${course.id}`}
                  >
                    Gerenciar conteúdo
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
