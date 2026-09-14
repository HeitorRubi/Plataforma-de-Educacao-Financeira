import { ArrowRight, Database } from "lucide-react";
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
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="page-container">
        <div className="page-intro">
          <p className="eyebrow">Administração</p>
          <h1 className="page-title">Base de conhecimento</h1>
          <p className="page-description">
            Conteúdo educacional publicado disponível para recuperação, com
            vínculo direto às aulas e fontes da plataforma.
          </p>
        </div>

        <div className="mt-6">
          <AdminCoursesNav />
        </div>

        <dl className="content-panel mt-8 grid grid-cols-2 overflow-hidden lg:grid-cols-4">
          {summaryItems.map((item, index) => (
            <div
              className={`p-5 ${
                index % 2 === 1
                  ? "border-l border-neutral-200"
                  : ""
              } ${index > 0 ? "lg:border-l" : ""}`}
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
              <h2 className="section-title">Documentos disponíveis</h2>
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
            <div className="content-panel mt-6 p-8 text-center">
              <Database aria-hidden="true" className="mx-auto text-neutral-400" size={28} />
              <h3 className="font-semibold">Nenhum conteúdo disponível</h3>
              <p className="mt-2 text-neutral-600">
                Publique um curso e uma aula com conteúdo para compor a base.
              </p>
            </div>
          ) : (
            <div className="content-panel mt-6 divide-y divide-neutral-200 px-5">
              {knowledgeBase.documents.map((document) => (
                <article
                  className="grid gap-5 py-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
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
                    className="text-link text-sm md:text-right"
                    href={`/cursos/${document.courseId}/modulos/${document.moduleId}/aulas/${document.lessonId}`}
                  >
                    Abrir aula <ArrowRight aria-hidden="true" size={15} />
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
