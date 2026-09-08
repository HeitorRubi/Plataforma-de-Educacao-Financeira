import Link from "next/link";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { AdminCoursesNav } from "@/components/courses/admin/admin-courses-nav";
import { requireAdmin } from "@/lib/courses/queries";
import { getKnowledgeBase } from "@/lib/knowledge/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function KnowledgeBasePage() {
  const user = await requireAdmin();
  const knowledgeBase = await getKnowledgeBase();
  const displayName = user.profile.full_name ?? "Usuário";
  const courseCount = new Set(
    knowledgeBase.documents.map((document) => document.courseId),
  ).size;
  const sourceCount = knowledgeBase.documents.reduce(
    (total, document) => total + document.sources.length,
    0,
  );
  const chunkCountByLesson = new Map<string, number>();

  for (const chunk of knowledgeBase.chunks) {
    chunkCountByLesson.set(
      chunk.lessonId,
      (chunkCountByLesson.get(chunk.lessonId) ?? 0) + 1,
    );
  }

  const summaryItems = [
    { label: "Cursos cobertos", value: courseCount },
    { label: "Aulas disponíveis", value: knowledgeBase.documents.length },
    { label: "Trechos preparados", value: knowledgeBase.chunks.length },
    { label: "Fontes associadas", value: sourceCount },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="border-b border-neutral-200 pb-7">
          <p className="text-sm font-semibold text-emerald-800">Administração</p>
          <h1 className="mt-2 text-3xl font-bold">Base de conhecimento</h1>
          <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
            Conteúdo educacional publicado disponível para recuperação, com
            vínculo direto às aulas e fontes da plataforma.
          </p>
        </div>

        <div className="mt-6">
          <AdminCoursesNav />
        </div>

        <dl className="mt-8 grid grid-cols-2 border-y border-neutral-200 lg:grid-cols-4">
          {summaryItems.map((item, index) => (
            <div
              className={`py-5 ${
                index % 2 === 1
                  ? "border-l border-neutral-200 pl-5"
                  : "pr-5"
              } ${index > 0 ? "lg:border-l lg:pl-5" : "lg:pr-5"}`}
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
              <h2 className="text-xl font-bold">Documentos disponíveis</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Cada documento corresponde a uma aula publicada com conteúdo.
              </p>
            </div>
            <span className="text-sm text-neutral-500">
              {knowledgeBase.documents.length}{" "}
              {knowledgeBase.documents.length === 1 ? "documento" : "documentos"}
            </span>
          </div>

          {knowledgeBase.documents.length === 0 ? (
            <div className="border-b border-neutral-200 py-10">
              <h3 className="font-semibold">Nenhum conteúdo disponível</h3>
              <p className="mt-2 text-neutral-600">
                Publique um curso e uma aula com conteúdo para compor a base.
              </p>
            </div>
          ) : (
            <div>
              {knowledgeBase.documents.map((document) => (
                <article
                  className="grid gap-5 border-b border-neutral-200 py-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
                  key={document.lessonId}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-800">
                      {document.courseTitle} · {document.moduleTitle}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-7">
                      {document.lessonTitle}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      Atualizada em{" "}
                      {dateFormatter.format(new Date(document.lessonUpdatedAt))}
                    </p>
                    <p className="mt-2 truncate text-sm text-neutral-600">
                      {document.sources.length > 0
                        ? `Fontes: ${document.sources.map((source) => source.title).join(", ")}`
                        : "Sem fonte associada"}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <dt className="text-neutral-500">Trechos</dt>
                      <dd className="mt-1 font-semibold">
                        {chunkCountByLesson.get(document.lessonId) ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Fontes</dt>
                      <dd className="mt-1 font-semibold">
                        {document.sources.length}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    className="text-sm font-semibold text-emerald-800 hover:underline md:text-right"
                    href={`/cursos/${document.courseId}/modulos/${document.moduleId}/aulas/${document.lessonId}`}
                  >
                    Abrir aula
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
