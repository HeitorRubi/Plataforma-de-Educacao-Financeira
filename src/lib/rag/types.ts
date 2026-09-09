import type {
  KnowledgeChunk,
  KnowledgeSource,
} from "@/lib/knowledge/types";

export type RetrievedKnowledgeChunk = {
  chunk: KnowledgeChunk;
  matchedTerms: string[];
  score: number;
};

export type RagAnswerStatus =
  | "answered"
  | "insufficient_context"
  | "restricted";

export type RagReference = {
  citationNumber: number;
  chunkId: string;
  chunkPosition: number;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonUrl: string;
  sources: KnowledgeSource[];
};

export type RagAnswer = {
  answer: string;
  status: RagAnswerStatus;
  references: RagReference[];
};
