import assert from "node:assert/strict";

import { requestsPersonalizedFinancialAdvice } from "../src/lib/rag/guardrails.ts";
import { isRagAnswer } from "../src/lib/rag/response-validation.ts";
import { retrieveKnowledgeChunks } from "../src/lib/rag/retrieval.ts";
import { validateQuestion } from "../src/lib/rag/validation.ts";

const chunkBase = {
  lessonId: "lesson-1",
  position: 1,
  courseId: "course-1",
  courseTitle: "Investindo Certo",
  moduleId: "module-1",
  moduleTitle: "Renda variável",
  lessonTitle: "Ações",
  sources: [],
};

const chunks = [
  {
    ...chunkBase,
    id: "lesson-1:1",
    content: "Ações representam pequenas partes do capital de uma empresa.",
  },
  {
    ...chunkBase,
    id: "lesson-1:2",
    content: "Diversificação ajuda a distribuir riscos entre investimentos.",
  },
];

const results = retrieveKnowledgeChunks(
  "O que são ações?",
  chunks,
);

assert.equal(results[0]?.chunk.id, "lesson-1:1");
assert.deepEqual(retrieveKnowledgeChunks("Como preparar arroz?", chunks), []);
assert.throws(() => retrieveKnowledgeChunks("ações", chunks, 0), RangeError);

assert.equal(
  requestsPersonalizedFinancialAdvice(
    "Você recomenda comprar ações para mim?",
  ),
  true,
);
assert.equal(requestsPersonalizedFinancialAdvice("O que são ações?"), false);

assert.deepEqual(validateQuestion("  O que são ações?  "), {
  success: true,
  question: "O que são ações?",
});
assert.equal(validateQuestion("x").success, false);
assert.equal(validateQuestion("x".repeat(501)).success, false);

const reference = {
  citationNumber: 1,
  chunkId: "lesson-1:1",
  chunkPosition: 1,
  courseId: "course-1",
  courseTitle: "Investindo Certo",
  moduleId: "module-1",
  moduleTitle: "Renda variável",
  lessonId: "lesson-1",
  lessonTitle: "Ações",
  lessonUrl: "/cursos/course-1/modulos/module-1/aulas/lesson-1",
  sources: [],
};

assert.equal(
  isRagAnswer({
    answer: "Ações representam partes do capital de uma empresa [1].",
    status: "answered",
    references: [reference],
  }),
  true,
);
assert.equal(
  isRagAnswer({
    answer: "Resposta sem contrato válido.",
    status: "unknown",
    references: [reference],
  }),
  false,
);

console.log("Recuperação, guardrails e validação RAG aprovados.");
