import assert from "node:assert/strict";

import {
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  validateEmail,
  validateFullName,
} from "../src/lib/auth/validation.ts";
import {
  isValidCourseId,
  validateCourseForm,
} from "../src/lib/courses/validation.ts";
import {
  buildKnowledgeChunks,
  chunkKnowledgeContent,
} from "../src/lib/knowledge/chunking.ts";
import {
  isValidLessonId,
  isValidSourceId,
  validateLessonForm,
  validateSourceForm,
} from "../src/lib/lessons/validation.ts";
import {
  isValidModuleId,
  readModuleDirection,
  validateModuleForm,
} from "../src/lib/modules/validation.ts";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

function createFormData(fields) {
  const formData = new FormData();

  for (const [field, value] of Object.entries(fields)) {
    formData.set(field, value);
  }

  return formData;
}

assert.equal(validateFullName("A"), "Informe um nome com pelo menos 2 caracteres.");
assert.equal(validateFullName("Ana Silva"), null);
assert.match(validateFullName("a".repeat(FULL_NAME_MAX_LENGTH + 1)), /máximo/);
assert.equal(validateEmail("usuario@example.com"), null);
assert.match(validateEmail("email-invalido"), /válido/);
assert.match(validateEmail("a".repeat(EMAIL_MAX_LENGTH + 1)), /máximo/);

assert.equal(isValidCourseId(VALID_UUID), true);
assert.equal(isValidCourseId("curso-invalido"), false);

const validCourse = validateCourseForm(
  createFormData({ title: "  Curso de teste  ", description: "  " }),
);
assert.deepEqual(validCourse, {
  data: { title: "Curso de teste", description: null },
  errors: {},
});
assert.ok(
  validateCourseForm(createFormData({ title: "ab" })).errors.title,
);
assert.ok(
  validateCourseForm(
    createFormData({ title: "Curso", description: "a".repeat(1001) }),
  ).errors.description,
);

assert.equal(isValidModuleId(VALID_UUID), true);
assert.equal(isValidModuleId("modulo-invalido"), false);
assert.equal(readModuleDirection(createFormData({ direction: "up" })), "up");
assert.equal(readModuleDirection(createFormData({ direction: "side" })), null);
assert.deepEqual(
  validateModuleForm(
    createFormData({ title: "  Módulo 1  ", description: "  Básico  " }),
  ),
  {
    data: { title: "Módulo 1", description: "Básico" },
    errors: {},
  },
);

assert.equal(isValidLessonId(VALID_UUID), true);
assert.equal(isValidSourceId(VALID_UUID), true);
assert.equal(isValidLessonId("aula-invalida"), false);
assert.deepEqual(
  validateLessonForm(
    createFormData({ title: "  Aula 1  ", content: "  Conteúdo  " }),
  ),
  { data: { title: "Aula 1", content: "Conteúdo" }, errors: {} },
);
assert.ok(
  validateLessonForm(
    createFormData({ title: "Aula", content: "a".repeat(100_001) }),
  ).errors.content,
);

const validSource = validateSourceForm(
  createFormData({
    title: "  Fonte oficial  ",
    author: "  Autor  ",
    url: "https://example.com/fonte",
    publicationYear: "2026",
  }),
);
assert.deepEqual(validSource, {
  data: {
    title: "Fonte oficial",
    author: "Autor",
    url: "https://example.com/fonte",
    publication_year: 2026,
  },
  errors: {},
});
assert.ok(
  validateSourceForm(
    createFormData({ title: "Fonte", url: "javascript:alert(1)" }),
  ).errors.url,
);
assert.ok(
  validateSourceForm(
    createFormData({ title: "Fonte", publicationYear: "26" }),
  ).errors.publicationYear,
);

assert.deepEqual(chunkKnowledgeContent("   "), []);
const splitChunks = chunkKnowledgeContent("a".repeat(450), 200);
assert.equal(splitChunks.length, 3);
assert.equal(splitChunks.every((chunk) => chunk.length <= 200), true);
assert.throws(() => chunkKnowledgeContent("conteúdo", 199), RangeError);

const builtChunks = buildKnowledgeChunks([
  {
    lessonId: "lesson-1",
    content: "Primeiro bloco.\n\nSegundo bloco.",
    courseId: "course-1",
    courseTitle: "Curso",
    moduleId: "module-1",
    moduleTitle: "Módulo",
    lessonTitle: "Aula",
    lessonUpdatedAt: "2026-09-14T00:00:00.000Z",
    sources: [],
  },
]);
assert.equal(builtChunks.length, 1);
assert.equal(builtChunks[0]?.id, "lesson-1:1");
assert.equal(builtChunks[0]?.position, 1);
assert.equal(builtChunks[0]?.courseTitle, "Curso");

console.log("Validações de autenticação, conteúdo e base de conhecimento aprovadas.");
