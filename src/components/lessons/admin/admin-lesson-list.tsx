import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";

import { LessonOrderControls } from "@/components/lessons/admin/lesson-order-controls";
import { LessonStatus } from "@/components/lessons/lesson-status";
import type { LessonSummary } from "@/lib/lessons/types";

type AdminLessonListProps = {
  courseId: string;
  moduleId: string;
  lessons: LessonSummary[];
};

export function AdminLessonList({
  courseId,
  moduleId,
  lessons,
}: AdminLessonListProps) {
  const basePath = `/admin/cursos/${courseId}/modulos/${moduleId}`;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h2 className="section-title">Aulas</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
          </p>
        </div>
        <Link
          className="button-primary h-10 px-4"
          href={`${basePath}/aulas/nova`}
        >
          <Plus aria-hidden="true" size={17} /> Criar aula
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="content-panel mt-6 p-7">
          <p className="font-medium">Nenhuma aula cadastrada</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Adicione a primeira aula textual deste módulo.
          </p>
        </div>
      ) : (
        <ol className="content-panel mt-6 divide-y divide-neutral-200 px-5">
          {lessons.map((lesson, index) => (
            <li
              className="grid gap-5 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              key={lesson.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase text-emerald-800">
                    Aula {lesson.position}
                  </p>
                  <LessonStatus isPublished={lesson.is_published} />
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-7">
                  {lesson.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-start gap-4">
                <Link
                  className="button-ghost h-9 px-2"
                  href={`${basePath}/aulas/${lesson.id}`}
                >
                  <Eye aria-hidden="true" size={16} /> Consultar
                </Link>
                <Link
                  className="button-ghost h-9 px-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  href={`${basePath}/aulas/${lesson.id}/editar`}
                >
                  <Pencil aria-hidden="true" size={15} /> Editar
                </Link>
                <LessonOrderControls
                  courseId={courseId}
                  isFirst={index === 0}
                  isLast={index === lessons.length - 1}
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  moduleId={moduleId}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
