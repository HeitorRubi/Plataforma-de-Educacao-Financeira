import type { CourseModule } from "@/lib/modules/types";

type CourseModuleOutlineProps = {
  modules: CourseModule[];
};

export function CourseModuleOutline({ modules }: CourseModuleOutlineProps) {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">Módulos do curso</h2>
        <span className="text-sm text-neutral-500">
          {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
        </span>
      </div>

      {modules.length === 0 ? (
        <p className="mt-5 border-y border-neutral-200 py-6 text-neutral-600">
          Este curso ainda não possui módulos cadastrados.
        </p>
      ) : (
        <ol className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
          {modules.map((module) => (
            <li className="grid gap-3 py-5 sm:grid-cols-[6rem_1fr]" key={module.id}>
              <p className="text-sm font-semibold text-emerald-800">
                Módulo {module.position}
              </p>
              <div>
                <h3 className="font-semibold leading-6">{module.title}</h3>
                {module.description && (
                  <p className="mt-2 whitespace-pre-wrap leading-6 text-neutral-600">
                    {module.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
