"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/courses/queries";
import { isValidCourseId } from "@/lib/courses/validation";
import type {
  ModuleFormState,
  ModuleOrderState,
} from "@/lib/modules/types";
import {
  isValidModuleId,
  readModuleDirection,
  validateModuleForm,
} from "@/lib/modules/validation";
import { createClient } from "@/lib/supabase/server";

function logModuleMutationError(operation: string, error: unknown) {
  console.error(`Supabase modules ${operation} error`, error);
}

function revalidateModulePaths(courseId: string, moduleId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/cursos");
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath(`/admin/cursos/${courseId}/modulos/novo`);
  revalidatePath(`/cursos/${courseId}`);

  if (moduleId) {
    revalidatePath(
      `/admin/cursos/${courseId}/modulos/${moduleId}/editar`,
    );
  }
}

export async function createModuleAction(
  courseId: string,
  _previousState: ModuleFormState,
  formData: FormData,
): Promise<ModuleFormState> {
  await requireAdmin();

  if (!isValidCourseId(courseId)) {
    return { message: "Curso inválido." };
  }

  const { data: values, errors } = validateModuleForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_course_module", {
    p_course_id: courseId,
    p_title: values.title,
    p_description: values.description,
  });

  if (error || typeof data !== "string") {
    logModuleMutationError("create", error);
    return { message: "Não foi possível criar o módulo." };
  }

  revalidateModulePaths(courseId, data);
  redirect(`/admin/cursos/${courseId}`);
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  _previousState: ModuleFormState,
  formData: FormData,
): Promise<ModuleFormState> {
  await requireAdmin();

  if (!isValidCourseId(courseId) || !isValidModuleId(moduleId)) {
    return { message: "Curso ou módulo inválido." };
  }

  const { data: values, errors } = validateModuleForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .update(values)
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logModuleMutationError("update", error);
    return { message: "Não foi possível atualizar o módulo." };
  }

  revalidateModulePaths(courseId, moduleId);
  return { message: "Módulo atualizado com sucesso.", success: true };
}

export async function moveModuleAction(
  courseId: string,
  moduleId: string,
  _previousState: ModuleOrderState,
  formData: FormData,
): Promise<ModuleOrderState> {
  await requireAdmin();

  const direction = readModuleDirection(formData);

  if (
    !isValidCourseId(courseId) ||
    !isValidModuleId(moduleId) ||
    !direction
  ) {
    return { message: "Solicitação de ordenação inválida." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("move_course_module", {
    p_course_id: courseId,
    p_module_id: moduleId,
    p_direction: direction === "up" ? -1 : 1,
  });

  if (error || data !== true) {
    logModuleMutationError("move", error);
    return { message: "Não foi possível alterar a posição do módulo." };
  }

  revalidateModulePaths(courseId, moduleId);
  return { message: "Ordem atualizada.", success: true };
}
