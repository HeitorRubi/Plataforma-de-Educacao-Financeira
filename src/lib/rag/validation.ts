export const MIN_QUESTION_LENGTH = 3;
export const MAX_QUESTION_LENGTH = 500;
export const MAX_CHAT_REQUEST_LENGTH = 2_000;

type QuestionValidation =
  | { success: true; question: string }
  | { success: false; message: string };

export function validateQuestion(value: unknown): QuestionValidation {
  if (typeof value !== "string") {
    return { success: false, message: "Informe uma pergunta válida." };
  }

  const question = value.trim();

  if (question.length < MIN_QUESTION_LENGTH) {
    return {
      success: false,
      message: `A pergunta deve possuir ao menos ${MIN_QUESTION_LENGTH} caracteres.`,
    };
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return {
      success: false,
      message: `A pergunta deve possuir no máximo ${MAX_QUESTION_LENGTH} caracteres.`,
    };
  }

  return { success: true, question };
}
