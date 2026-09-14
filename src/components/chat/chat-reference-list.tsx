import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { RagReference } from "@/lib/rag/types";

function ReferenceItem({ reference }: { reference: RagReference }) {
  return (
    <article className="grid gap-3 border-t border-neutral-200 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
      <span className="font-semibold text-emerald-800">
        [{reference.citationNumber}]
      </span>

      <div className="min-w-0 break-words">
        <h5 className="font-semibold text-neutral-950">
          {reference.lessonTitle}
        </h5>
        <p className="mt-1 text-sm leading-6 text-neutral-600">
          {reference.courseTitle} · {reference.moduleTitle} · Trecho{" "}
          {reference.chunkPosition}
        </p>

        {reference.sources.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {reference.sources.map((source) => {
              const details = [source.author, source.publicationYear]
                .filter(Boolean)
                .join(" · ");

              return (
                <li className="break-words" key={source.id}>
                  {source.url ? (
                    <a
                      className="font-medium text-emerald-800 hover:underline"
                      href={source.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span className="font-medium">{source.title}</span>
                  )}
                  {details && (
                    <span className="text-neutral-500"> · {details}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link
        className="text-link text-sm sm:pt-0.5"
        href={reference.lessonUrl}
      >
        Abrir aula <ExternalLink aria-hidden="true" size={14} />
      </Link>
    </article>
  );
}

export function ChatReferenceList({
  references,
}: {
  references: RagReference[];
}) {
  if (references.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-2 pb-3">
        <h4 className="font-bold">Referências utilizadas</h4>
        <span className="text-sm text-neutral-500">
          {references.length}{" "}
          {references.length === 1 ? "referência" : "referências"}
        </span>
      </div>
      <div className="border-b border-neutral-200">
        {references.map((reference) => (
          <ReferenceItem
            key={`${reference.chunkId}:${reference.citationNumber}`}
            reference={reference}
          />
        ))}
      </div>
    </section>
  );
}
