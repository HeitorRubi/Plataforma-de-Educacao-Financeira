"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/courses/queries";
import type { CourseFormState } from "@/lib/courses/types";
import {
  isValidCourseId,
  validateCourseForm,
} from "@/lib/courses/validation";
import { createClient } from "@/lib/supabase/server";

function logCourseMutationError(operation: string, error: unknown) {
  console.error(`Supabase courses ${operation} error`, error);
}

function revalidateCoursePaths(courseId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");

  if (courseId) {
    revalidatePath(`/admin/cursos/${courseId}`);
    revalidatePath(`/admin/cursos/${courseId}/editar`);
    revalidatePath(`/cursos/${courseId}`);
  }
}

export async function createCourseAction(
  _previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdmin();

  const { data: values, errors } = validateCourseForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert(values)
    .select("id")
    .single();

  if (error || !data) {
    logCourseMutationError("create", error);
    return { message: "Não foi possível criar o curso." };
  }

  revalidateCoursePaths(data.id);
  redirect(`/admin/cursos/${data.id}`);
}

export async function updateCourseAction(
  courseId: string,
  _previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdmin();

  if (!isValidCourseId(courseId)) {
    return { message: "Curso inválido." };
  }

  const { data: values, errors } = validateCourseForm(formData);

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .update(values)
    .eq("id", courseId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logCourseMutationError("update", error);
    return { message: "Não foi possível atualizar o curso." };
  }

  revalidateCoursePaths(courseId);
  return { message: "Curso atualizado com sucesso.", success: true };
}

export async function setCoursePublicationAction(
  courseId: string,
  isPublished: boolean,
  _previousState: CourseFormState,
  _formData: FormData,
): Promise<CourseFormState> {
  void _previousState;
  void _formData;

  await requireAdmin();

  if (!isValidCourseId(courseId)) {
    return { message: "Curso inválido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .update({ is_published: isPublished })
    .eq("id", courseId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logCourseMutationError("publish", error);
    return {
      message: `Não foi possível ${isPublished ? "publicar" : "despublicar"} o curso.`,
    };
  }

  revalidateCoursePaths(courseId);

  return {
    message: `Curso ${isPublished ? "publicado" : "despublicado"} com sucesso.`,
    success: true,
  };
}
