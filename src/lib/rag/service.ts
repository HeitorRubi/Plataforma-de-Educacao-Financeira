import "server-only";

import { getKnowledgeBase } from "@/lib/knowledge/queries";
import { requestsPersonalizedFinancialAdvice } from "@/lib/rag/guardrails";
import { generateGroundedAnswer } from "@/lib/rag/groq";
import { retrieveKnowledgeChunks } from "@/lib/rag/retrieval";
import type {
  RagAnswer,
  RagReference,
  RetrievedKnowledgeChunk,
} from "@/lib/rag/types";

const INSUFFICIENT_CONTEXT_ANSWER =
  "Não encontrei informação suficiente na base de conhecimento da plataforma para responder a essa pergunta.";

const RESTRICTED_ADVICE_ANSWER =
  "Posso explicar conceitos de educação financeira com base no conteúdo da plataforma, mas não posso recomendar compras, vendas ou decisões financeiras personalizadas. Reformule a pergunta para solicitar uma explicação geral.";

function buildReferences(
  results: RetrievedKnowledgeChunk[],
): RagReference[] {
  return results.map(({ chunk }, index) => ({
    citationNumber: index + 1,
    chunkId: chunk.id,
    chunkPosition: chunk.position,
    courseId: chunk.courseId,
    courseTitle: chunk.courseTitle,
    moduleId: chunk.moduleId,
    moduleTitle: chunk.moduleTitle,
    lessonId: chunk.lessonId,
    lessonTitle: chunk.lessonTitle,
    lessonUrl: `/cursos/${chunk.courseId}/modulos/${chunk.moduleId}/aulas/${chunk.lessonId}`,
    sources: chunk.sources,
  }));
}

export async function answerKnowledgeQuestion(
  question: string,
): Promise<RagAnswer> {
  if (requestsPersonalizedFinancialAdvice(question)) {
    return {
      answer: RESTRICTED_ADVICE_ANSWER,
      status: "restricted",
      references: [],
    };
  }

  const knowledgeBase = await getKnowledgeBase();
  const results = retrieveKnowledgeChunks(question, knowledgeBase.chunks);

  if (results.length === 0) {
    return {
      answer: INSUFFICIENT_CONTEXT_ANSWER,
      status: "insufficient_context",
      references: [],
    };
  }

  return {
    answer: await generateGroundedAnswer(question, results),
    status: "answered",
    references: buildReferences(results),
  };
}
