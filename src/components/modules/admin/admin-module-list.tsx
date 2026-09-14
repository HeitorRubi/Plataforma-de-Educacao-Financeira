import { BookOpen, Pencil, Plus } from "lucide-react";
import Link from "next/link";

import { ModuleOrderControls } from "@/components/modules/admin/module-order-controls";
import type { CourseModule } from "@/lib/modules/types";

type AdminModuleListProps = {
  courseId: string;
  modules: CourseModule[];
};

export function AdminModuleList({ courseId, modules }: AdminModuleListProps) {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Módulos</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
          </p>
        </div>
        <Link
          className="button-primary h-10 px-4"
          href={`/admin/cursos/${courseId}/modulos/novo`}
        >
          <Plus aria-hidden="true" size={17} /> Criar módulo
        </Link>
      </div>

      {modules.length === 0 ? (
        <div className="content-panel mt-6 p-7">
          <p className="font-medium">Nenhum módulo cadastrado</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Adicione o primeiro módulo para estruturar este curso.
          </p>
        </div>
      ) : (
        <ol className="content-panel mt-6 divide-y divide-neutral-200 px-5">
          {modules.map((module, index) => (
            <li
              className="grid gap-5 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              key={module.id}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-emerald-800">
                  Módulo {module.position}
                </p>
                <h3 className="mt-1 text-lg font-semibold leading-7">
                  {module.title}
                </h3>
                <p className="mt-1 line-clamp-2 leading-6 text-neutral-600">
                  {module.description || "Sem descrição."}
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-4">
                <Link
                  className="button-ghost h-9 px-2"
                  href={`/admin/cursos/${courseId}/modulos/${module.id}`}
                >
                  <BookOpen aria-hidden="true" size={16} /> Gerenciar aulas
                </Link>
                <Link
                  className="button-ghost h-9 px-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  href={`/admin/cursos/${courseId}/modulos/${module.id}/editar`}
                >
                  <Pencil aria-hidden="true" size={15} /> Editar
                </Link>
                <ModuleOrderControls
                  courseId={courseId}
                  isFirst={index === 0}
                  isLast={index === modules.length - 1}
                  moduleId={module.id}
                  moduleTitle={module.title}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
