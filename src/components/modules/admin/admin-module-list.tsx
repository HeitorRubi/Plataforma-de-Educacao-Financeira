import Link from "next/link";

import { ModuleOrderControls } from "@/components/modules/admin/module-order-controls";
import type { CourseModule } from "@/lib/modules/types";

type AdminModuleListProps = {
  courseId: string;
  modules: CourseModule[];
};

export function AdminModuleList({ courseId, modules }: AdminModuleListProps) {
  return (
    <section className="border-b border-neutral-200 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Módulos</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900"
          href={`/admin/cursos/${courseId}/modulos/novo`}
        >
          Criar módulo
        </Link>
      </div>

      {modules.length === 0 ? (
        <div className="mt-6 border-y border-neutral-200 py-7">
          <p className="font-medium">Nenhum módulo cadastrado</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Adicione o primeiro módulo para estruturar este curso.
          </p>
        </div>
      ) : (
        <ol className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
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
                  className="inline-flex h-9 items-center text-sm font-semibold text-emerald-800 hover:underline"
                  href={`/admin/cursos/${courseId}/modulos/${module.id}`}
                >
                  Gerenciar aulas
                </Link>
                <Link
                  className="inline-flex h-9 items-center text-sm font-semibold text-neutral-700 hover:text-neutral-950 hover:underline"
                  href={`/admin/cursos/${courseId}/modulos/${module.id}/editar`}
                >
                  Editar
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
