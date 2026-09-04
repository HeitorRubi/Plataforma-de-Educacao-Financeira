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
    <section className="border-b border-neutral-200 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Fontes e referências</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {sources.length} {sources.length === 1 ? "fonte" : "fontes"}
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900"
          href={`${basePath}/fontes/nova`}
        >
          Adicionar fonte
        </Link>
      </div>

      {sources.length === 0 ? (
        <div className="mt-6 border-y border-neutral-200 py-7">
          <p className="font-medium">Nenhuma fonte cadastrada</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Cadastre somente referências verificadas para esta aula.
          </p>
        </div>
      ) : (
        <ol className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
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
                  className="inline-flex h-9 items-center text-sm font-semibold text-emerald-800 hover:underline"
                  href={`${basePath}/fontes/${source.id}/editar`}
                >
                  Editar
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
