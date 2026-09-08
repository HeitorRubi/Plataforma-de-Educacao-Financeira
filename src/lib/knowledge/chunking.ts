import type {
  KnowledgeChunk,
  KnowledgeDocument,
} from "@/lib/knowledge/types";

export const KNOWLEDGE_CHUNK_MAX_LENGTH = 1200;

function splitOversizedBlock(block: string, maxLength: number): string[] {
  const pieces: string[] = [];
  let remaining = block.trim();

  while (remaining.length > maxLength) {
    const window = remaining.slice(0, maxLength + 1);
    const minimumNaturalBreak = Math.floor(maxLength * 0.6);
    const naturalBreak = Math.max(
      window.lastIndexOf("\n"),
      window.lastIndexOf(". "),
      window.lastIndexOf(" "),
    );
    const breakAt =
      naturalBreak >= minimumNaturalBreak ? naturalBreak + 1 : maxLength;
    const piece = remaining.slice(0, breakAt).trim();

    if (piece) {
      pieces.push(piece);
    }

    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) {
    pieces.push(remaining);
  }

  return pieces;
}

export function chunkKnowledgeContent(
  content: string,
  maxLength = KNOWLEDGE_CHUNK_MAX_LENGTH,
): string[] {
  if (!Number.isInteger(maxLength) || maxLength < 200) {
    throw new RangeError("O tamanho máximo do trecho deve ser de ao menos 200 caracteres.");
  }

  const blocks = content
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => splitOversizedBlock(block, maxLength));
  const chunks: string[] = [];
  let currentChunk = "";

  for (const block of blocks) {
    const candidate = currentChunk ? `${currentChunk}\n\n${block}` : block;

    if (candidate.length <= maxLength) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    currentChunk = block;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function buildKnowledgeChunks(
  documents: KnowledgeDocument[],
): KnowledgeChunk[] {
  return documents.flatMap((document) =>
    chunkKnowledgeContent(document.content).map((content, index) => ({
      id: `${document.lessonId}:${index + 1}`,
      lessonId: document.lessonId,
      position: index + 1,
      content,
      courseId: document.courseId,
      courseTitle: document.courseTitle,
      moduleId: document.moduleId,
      moduleTitle: document.moduleTitle,
      lessonTitle: document.lessonTitle,
      sources: document.sources,
    })),
  );
}
