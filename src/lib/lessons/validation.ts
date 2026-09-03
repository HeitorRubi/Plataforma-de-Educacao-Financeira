import type {
  LessonFieldErrors,
  OrderDirection,
  SourceFieldErrors,
} from "@/lib/lessons/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function isValidLessonId(id: string) {
  return UUID_PATTERN.test(id);
}

export function isValidSourceId(id: string) {
  return UUID_PATTERN.test(id);
}

export function readOrderDirection(
  formData: FormData,
): OrderDirection | null {
  const direction = formData.get("direction");
  return direction === "up" || direction === "down" ? direction : null;
}

export function validateLessonForm(formData: FormData) {
  const title = readText(formData, "title");
  const content = readText(formData, "content");
  const errors: LessonFieldErrors = {};

  if (title.length < 3) {
    errors.title = "Informe um título com pelo menos 3 caracteres.";
  } else if (title.length > 120) {
    errors.title = "O título deve possuir no máximo 120 caracteres.";
  }

  if (content.length > 100_000) {
    errors.content = "O conteúdo deve possuir no máximo 100.000 caracteres.";
  }

  return { data: { title, content }, errors };
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSourceForm(formData: FormData) {
  const title = readText(formData, "title");
  const author = readText(formData, "author");
  const url = readText(formData, "url");
  const publicationYearValue = readText(formData, "publicationYear");
  const errors: SourceFieldErrors = {};
  let publicationYear: number | null = null;

  if (title.length < 3) {
    errors.title = "Informe um título com pelo menos 3 caracteres.";
  } else if (title.length > 200) {
    errors.title = "O título deve possuir no máximo 200 caracteres.";
  }

  if (author.length > 200) {
    errors.author = "O autor deve possuir no máximo 200 caracteres.";
  }

  if (url.length > 2_000) {
    errors.url = "A URL deve possuir no máximo 2.000 caracteres.";
  } else if (url && !isValidHttpUrl(url)) {
    errors.url = "Informe uma URL completa iniciada por http:// ou https://.";
  }

  if (publicationYearValue) {
    if (!/^\d{4}$/.test(publicationYearValue)) {
      errors.publicationYear = "Informe o ano com quatro dígitos.";
    } else {
      publicationYear = Number(publicationYearValue);
    }
  }

  return {
    data: {
      title,
      author: author || null,
      url: url || null,
      publication_year: publicationYear,
    },
    errors,
  };
}
