import type { LessonSource } from "@/lib/lessons/types";

type LessonSourcesProps = {
  sources: LessonSource[];
};

export function LessonSources({ sources }: LessonSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 py-8">
      <h2 className="text-xl font-semibold">Fontes e referências</h2>
      <ol className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
        {sources.map((source) => (
          <li className="py-5" key={source.id}>
            <p className="font-semibold">{source.title}</p>
            {(source.author || source.publication_year) && (
              <p className="mt-1 text-sm text-neutral-600">
                {[source.author, source.publication_year]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {source.url && (
              <a
                className="mt-2 inline-flex text-sm font-semibold text-emerald-800 hover:underline"
                href={source.url}
                rel="noreferrer"
                target="_blank"
              >
                Acessar fonte
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
