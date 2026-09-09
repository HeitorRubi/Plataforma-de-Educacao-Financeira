import type { KnowledgeChunk } from "@/lib/knowledge/types";
import type { RetrievedKnowledgeChunk } from "@/lib/rag/types";

export const DEFAULT_RETRIEVAL_LIMIT = 4;

const PORTUGUESE_STOP_WORDS = new Set([
  "a",
  "ao",
  "aos",
  "as",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "ela",
  "ele",
  "em",
  "entre",
  "essa",
  "esse",
  "esta",
  "este",
  "eu",
  "isso",
  "mais",
  "me",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "ou",
  "para",
  "pela",
  "pelo",
  "por",
  "qual",
  "que",
  "sao",
  "se",
  "sem",
  "ser",
  "sua",
  "suas",
  "um",
  "uma",
]);

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function canonicalizeToken(token: string): string {
  if (token.endsWith("coes") && token.length > 4) {
    return `${token.slice(0, -4)}cao`;
  }

  if (token.endsWith("oes") && token.length > 4) {
    return `${token.slice(0, -3)}ao`;
  }

  if (token.endsWith("s") && token.length > 4) {
    return token.slice(0, -1);
  }

  return token;
}

function tokenize(value: string): string[] {
  return Array.from(
    new Set(
      normalizeText(value)
        .split(/\s+/)
        .filter(
          (token) =>
            token.length >= 3 && !PORTUGUESE_STOP_WORDS.has(token),
        )
        .map(canonicalizeToken),
    ),
  );
}

function createTokenSet(value: string): Set<string> {
  return new Set(tokenize(value));
}

function scoreChunk(
  questionTerms: string[],
  normalizedQuestion: string,
  chunk: KnowledgeChunk,
): RetrievedKnowledgeChunk | null {
  const contentTokens = createTokenSet(chunk.content);
  const titleTokens = createTokenSet(
    `${chunk.courseTitle} ${chunk.moduleTitle} ${chunk.lessonTitle}`,
  );
  const matchedTerms = questionTerms.filter(
    (term) => contentTokens.has(term) || titleTokens.has(term),
  );

  if (matchedTerms.length === 0) {
    return null;
  }

  const coverage = matchedTerms.length / questionTerms.length;
  const minimumMatches = Math.min(2, questionTerms.length);

  if (matchedTerms.length < minimumMatches && coverage < 0.6) {
    return null;
  }

  const titleMatches = matchedTerms.filter((term) => titleTokens.has(term)).length;
  const normalizedContent = normalizeText(chunk.content);
  const phraseBonus =
    normalizedQuestion.length >= 8 &&
    normalizedContent.includes(normalizedQuestion)
      ? 6
      : 0;

  return {
    chunk,
    matchedTerms,
    score:
      matchedTerms.length * 3 + titleMatches * 2 + coverage * 5 + phraseBonus,
  };
}

export function retrieveKnowledgeChunks(
  question: string,
  chunks: KnowledgeChunk[],
  limit = DEFAULT_RETRIEVAL_LIMIT,
): RetrievedKnowledgeChunk[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("O limite de recuperação deve ser um inteiro positivo.");
  }

  const questionTerms = tokenize(question);

  if (questionTerms.length === 0) {
    return [];
  }

  const normalizedQuestion = normalizeText(question);

  return chunks
    .map((chunk) => scoreChunk(questionTerms, normalizedQuestion, chunk))
    .filter((result): result is RetrievedKnowledgeChunk => result !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.chunk.courseTitle.localeCompare(right.chunk.courseTitle, "pt-BR") ||
        left.chunk.position - right.chunk.position,
    )
    .slice(0, limit);
}
