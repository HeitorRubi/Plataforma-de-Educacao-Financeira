import type { RagAnswer, RagReference } from "@/lib/rag/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isRagReference(value: unknown): value is RagReference {
  if (!isRecord(value) || !Array.isArray(value.sources)) {
    return false;
  }

  const validSources = value.sources.every(
    (source) =>
      isRecord(source) &&
      typeof source.id === "string" &&
      typeof source.title === "string" &&
      isNullableString(source.author) &&
      isNullableString(source.url) &&
      (source.publicationYear === null ||
        typeof source.publicationYear === "number") &&
      typeof source.position === "number",
  );

  return (
    validSources &&
    typeof value.citationNumber === "number" &&
    typeof value.chunkId === "string" &&
    typeof value.chunkPosition === "number" &&
    typeof value.courseId === "string" &&
    typeof value.courseTitle === "string" &&
    typeof value.moduleId === "string" &&
    typeof value.moduleTitle === "string" &&
    typeof value.lessonId === "string" &&
    typeof value.lessonTitle === "string" &&
    typeof value.lessonUrl === "string"
  );
}

export function isRagAnswer(value: unknown): value is RagAnswer {
  if (!isRecord(value) || !Array.isArray(value.references)) {
    return false;
  }

  return (
    typeof value.answer === "string" &&
    (value.status === "answered" ||
      value.status === "insufficient_context" ||
      value.status === "restricted") &&
    value.references.every(isRagReference)
  );
}
