import type {
  ModuleDirection,
  ModuleFieldErrors,
} from "@/lib/modules/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function isValidModuleId(id: string) {
  return UUID_PATTERN.test(id);
}

export function readModuleDirection(
  formData: FormData,
): ModuleDirection | null {
  const direction = formData.get("direction");
  return direction === "up" || direction === "down" ? direction : null;
}

export function validateModuleForm(formData: FormData) {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const errors: ModuleFieldErrors = {};

  if (title.length < 3) {
    errors.title = "Informe um título com pelo menos 3 caracteres.";
  } else if (title.length > 120) {
    errors.title = "O título deve possuir no máximo 120 caracteres.";
  }

  if (description.length > 1000) {
    errors.description = "A descrição deve possuir no máximo 1000 caracteres.";
  }

  return {
    data: {
      title,
      description: description || null,
    },
    errors,
  };
}
