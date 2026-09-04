"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/courses/queries";
import { isValidCourseId } from "@/lib/courses/validation";
import type {
  LessonActionState,
  LessonFormState,
} from "@/lib/lessons/types";
import {
  isValidLessonId,
  readOrderDirection,
  validateLessonForm,
} from "@/lib/lessons/validation";
import { isValidModuleId } from "@/lib/modules/validation";
import { createClient } from "@/lib/supabase/server";

function logLessonMutationError(operation: string, error: unknown) {
  console.error(`Supabase lessons ${operation} error`, error);
}

function lessonPath(courseId: string, moduleId: string, lessonId: string) {
  return `/admin/cursos/${courseId}/modulos/${moduleId}/aulas/${lessonId}`;
}

function revalidateLessonPaths(
  courseId: string,
  moduleId: string,
  lessonId?: string,
) {
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath(`/admin/cursos/${courseId}/modulos/${moduleId}`);
  revalidatePath(`/admin/cursos/${courseId}/modulos/${moduleId}/aulas/nova`);
  revalidatePath(`/cursos/${courseId}`);

  if (lessonId) {
    const adminLessonPath = lessonPath(courseId, moduleId, lessonId);
    revalidatePath(adminLessonPath);
    revalidatePath(`${adminLessonPath}/editar`);
    revalidatePath(
      `/cursos/${courseId}/modulos/${moduleId}/aulas/${lessonId}`,
    );
  }
}

function hasValidLessonContext(
  courseId: string,
  moduleId: string,
  lessonId?: string,
) {
  return (
    isValidCourseId(courseId) &&
    isValidModuleId(moduleId) &&
    (!lessonId || isValidLessonId(lessonId))
  );
}

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  _previousState: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();

  if (!hasValidLessonContext(courseId, moduleId)) {
    return { message: "Curso ou módulo inválido." };
  }

  const { data: values, errors } = validateLessonForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_module_lesson", {
    p_course_id: courseId,
    p_module_id: moduleId,
    p_title: values.title,
    p_content: values.content,
  });

  if (error || typeof data !== "string") {
    logLessonMutationError("create", error);
    return { message: "Não foi possível criar a aula." };
  }

  revalidateLessonPaths(courseId, moduleId, data);
  redirect(lessonPath(courseId, moduleId, data));
}

export async function updateLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  _previousState: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();

  if (!hasValidLessonContext(courseId, moduleId, lessonId)) {
    return { message: "Curso, módulo ou aula inválida." };
  }

  const { data: values, errors } = validateLessonForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data: moduleContext, error: moduleError } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (moduleError || !moduleContext) {
    logLessonMutationError("validate update context", moduleError);
    return { message: "A aula não pertence ao curso informado." };
  }

  const { data, error } = await supabase
    .from("lessons")
    .update(values)
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logLessonMutationError("update", error);
    return { message: "Não foi possível atualizar a aula." };
  }

  revalidateLessonPaths(courseId, moduleId, lessonId);
  return { message: "Aula atualizada com sucesso.", success: true };
}

export async function setLessonPublicationAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  isPublished: boolean,
  _previousState: LessonActionState,
  _formData: FormData,
): Promise<LessonActionState> {
  void _previousState;
  void _formData;

  await requireAdmin();

  if (!hasValidLessonContext(courseId, moduleId, lessonId)) {
    return { message: "Curso, módulo ou aula inválida." };
  }

  const supabase = await createClient();
  const { data: moduleContext, error: moduleError } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (moduleError || !moduleContext) {
    logLessonMutationError("validate publication context", moduleError);
    return { message: "A aula não pertence ao curso informado." };
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, content")
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (lessonError || !lesson) {
    logLessonMutationError("read before publication", lessonError);
    return { message: "Aula não encontrada." };
  }

  if (isPublished && !lesson.content.trim()) {
    return { message: "Informe o conteúdo antes de publicar a aula." };
  }

  const { data, error } = await supabase
    .from("lessons")
    .update({ is_published: isPublished })
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logLessonMutationError("publish", error);
    return {
      message: `Não foi possível ${isPublished ? "publicar" : "despublicar"} a aula.`,
    };
  }

  revalidateLessonPaths(courseId, moduleId, lessonId);
  return {
    message: `Aula ${isPublished ? "publicada" : "despublicada"} com sucesso.`,
    success: true,
  };
}

export async function moveLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  _previousState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  await requireAdmin();

  const direction = readOrderDirection(formData);

  if (!hasValidLessonContext(courseId, moduleId, lessonId) || !direction) {
    return { message: "Solicitação de ordenação inválida." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("move_module_lesson", {
    p_course_id: courseId,
    p_module_id: moduleId,
    p_lesson_id: lessonId,
    p_direction: direction === "up" ? -1 : 1,
  });

  if (error || data !== true) {
    logLessonMutationError("move", error);
    return { message: "Não foi possível alterar a posição da aula." };
  }

  revalidateLessonPaths(courseId, moduleId, lessonId);
  return { message: "Ordem atualizada.", success: true };
}
