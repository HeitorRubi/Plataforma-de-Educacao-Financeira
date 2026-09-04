"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/courses/queries";
import { isValidCourseId } from "@/lib/courses/validation";
import type {
  LessonActionState,
  SourceFormState,
} from "@/lib/lessons/types";
import {
  isValidLessonId,
  isValidSourceId,
  readOrderDirection,
  validateSourceForm,
} from "@/lib/lessons/validation";
import { isValidModuleId } from "@/lib/modules/validation";
import { createClient } from "@/lib/supabase/server";

function logSourceMutationError(operation: string, error: unknown) {
  console.error(`Supabase lesson sources ${operation} error`, error);
}

function adminLessonPath(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  return `/admin/cursos/${courseId}/modulos/${moduleId}/aulas/${lessonId}`;
}

function revalidateSourcePaths(
  courseId: string,
  moduleId: string,
  lessonId: string,
  sourceId?: string,
) {
  const lessonPath = adminLessonPath(courseId, moduleId, lessonId);
  revalidatePath("/admin");
  revalidatePath(lessonPath);
  revalidatePath(`${lessonPath}/fontes/nova`);
  revalidatePath(
    `/cursos/${courseId}/modulos/${moduleId}/aulas/${lessonId}`,
  );

  if (sourceId) {
    revalidatePath(`${lessonPath}/fontes/${sourceId}/editar`);
  }
}

function hasValidSourceContext(
  courseId: string,
  moduleId: string,
  lessonId: string,
  sourceId?: string,
) {
  return (
    isValidCourseId(courseId) &&
    isValidModuleId(moduleId) &&
    isValidLessonId(lessonId) &&
    (!sourceId || isValidSourceId(sourceId))
  );
}

export async function createSourceAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  _previousState: SourceFormState,
  formData: FormData,
): Promise<SourceFormState> {
  await requireAdmin();

  if (!hasValidSourceContext(courseId, moduleId, lessonId)) {
    return { message: "Curso, módulo ou aula inválida." };
  }

  const { data: values, errors } = validateSourceForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_lesson_source", {
    p_course_id: courseId,
    p_module_id: moduleId,
    p_lesson_id: lessonId,
    p_title: values.title,
    p_author: values.author,
    p_url: values.url,
    p_publication_year: values.publication_year,
  });

  if (error || typeof data !== "string") {
    logSourceMutationError("create", error);
    return { message: "Não foi possível criar a fonte." };
  }

  revalidateSourcePaths(courseId, moduleId, lessonId, data);
  redirect(adminLessonPath(courseId, moduleId, lessonId));
}

export async function updateSourceAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  sourceId: string,
  _previousState: SourceFormState,
  formData: FormData,
): Promise<SourceFormState> {
  await requireAdmin();

  if (!hasValidSourceContext(courseId, moduleId, lessonId, sourceId)) {
    return { message: "Curso, módulo, aula ou fonte inválida." };
  }

  const { data: values, errors } = validateSourceForm(formData);

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

  const { data: lessonContext, error: lessonError } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (moduleError || lessonError || !moduleContext || !lessonContext) {
    logSourceMutationError(
      "validate update context",
      moduleError ?? lessonError,
    );
    return { message: "A fonte não pertence à aula informada." };
  }

  const { data, error } = await supabase
    .from("lesson_sources")
    .update(values)
    .eq("id", sourceId)
    .eq("lesson_id", lessonId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logSourceMutationError("update", error);
    return { message: "Não foi possível atualizar a fonte." };
  }

  revalidateSourcePaths(courseId, moduleId, lessonId, sourceId);
  return { message: "Fonte atualizada com sucesso.", success: true };
}

export async function moveSourceAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  sourceId: string,
  _previousState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  await requireAdmin();

  const direction = readOrderDirection(formData);

  if (
    !hasValidSourceContext(courseId, moduleId, lessonId, sourceId) ||
    !direction
  ) {
    return { message: "Solicitação de ordenação inválida." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("move_lesson_source", {
    p_course_id: courseId,
    p_module_id: moduleId,
    p_lesson_id: lessonId,
    p_source_id: sourceId,
    p_direction: direction === "up" ? -1 : 1,
  });

  if (error || data !== true) {
    logSourceMutationError("move", error);
    return { message: "Não foi possível alterar a posição da fonte." };
  }

  revalidateSourcePaths(courseId, moduleId, lessonId, sourceId);
  return { message: "Ordem atualizada.", success: true };
}
