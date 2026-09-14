import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

import { SourceOrderControls } from "@/components/lessons/admin/source-order-controls";
import type { LessonSource } from "@/lib/lessons/types";

type AdminSourceListProps = {
  courseId: string;
  moduleId: string;
  lessonId: string;
  sources: LessonSource[];
};

export function AdminSourceList({
  courseId,
  moduleId,
  lessonId,
  sources,
}: AdminSourceListProps) {
  const basePath = `/admin/cursos/${courseId}/modulos/${moduleId}/aulas/${lessonId}`;

  return (
    <section className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Fontes e referências</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {sources.length} {sources.length === 1 ? "fonte" : "fontes"}
          </p>
        </div>
        <Link
          className="button-primary h-10 px-4"
          href={`${basePath}/fontes/nova`}
        >
          <Plus aria-hidden="true" size={17} /> Adicionar fonte
        </Link>
      </div>

      {sources.length === 0 ? (
        <div className="content-panel mt-6 p-7">
          <p className="font-medium">Nenhuma fonte cadastrada</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Cadastre somente referências verificadas para esta aula.
          </p>
        </div>
      ) : (
        <ol className="content-panel mt-6 divide-y divide-neutral-200 px-5">
          {sources.map((source, index) => (
            <li
              className="grid gap-5 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              key={source.id}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-emerald-800">
                  Fonte {source.position}
                </p>
                <h3 className="mt-1 font-semibold leading-6">{source.title}</h3>
                {(source.author || source.publication_year) && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {[source.author, source.publication_year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {source.url && (
                  <a
                    className="mt-2 inline-flex max-w-full truncate text-sm text-emerald-800 hover:underline"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.url}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-start gap-4">
                <Link
                  className="button-ghost h-9 px-2"
                  href={`${basePath}/fontes/${source.id}/editar`}
                >
                  <Pencil aria-hidden="true" size={15} /> Editar
                </Link>
                <SourceOrderControls
                  courseId={courseId}
                  isFirst={index === 0}
                  isLast={index === sources.length - 1}
                  lessonId={lessonId}
                  moduleId={moduleId}
                  sourceId={source.id}
                  sourceTitle={source.title}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
