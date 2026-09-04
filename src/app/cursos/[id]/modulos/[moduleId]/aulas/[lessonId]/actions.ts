"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { getPublishedCourse } from "@/lib/courses/queries";
import { isValidCourseId } from "@/lib/courses/validation";
import { getPublishedLesson } from "@/lib/lessons/queries";
import { isValidLessonId } from "@/lib/lessons/validation";
import { listPublishedCourseModules } from "@/lib/modules/queries";
import { isValidModuleId } from "@/lib/modules/validation";
import type { ProgressActionState } from "@/lib/progress/types";
import { createClient } from "@/lib/supabase/server";

export async function completeLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  _previousState: ProgressActionState,
  _formData: FormData,
): Promise<ProgressActionState> {
  void _previousState;
  void _formData;

  const user = await requireUser();

  if (
    !isValidCourseId(courseId) ||
    !isValidModuleId(moduleId) ||
    !isValidLessonId(lessonId)
  ) {
    return { message: "Curso, módulo ou aula inválida." };
  }

  const [course, modules, lesson] = await Promise.all([
    getPublishedCourse(courseId),
    listPublishedCourseModules(courseId),
    getPublishedLesson(moduleId, lessonId),
  ]);

  if (!course || !modules.some((item) => item.id === moduleId) || !lesson) {
    return { message: "A aula publicada não foi encontrada neste curso." };
  }

  const supabase = await createClient();
  const { data: existingProgress, error: existingError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingError) {
    console.error("Supabase lesson progress read before insert error", existingError);
    return { message: "Não foi possível verificar o progresso da aula." };
  }

  if (existingProgress) {
    return { message: "Esta aula já está concluída.", success: true };
  }

  const { error } = await supabase.from("lesson_progress").insert({
    user_id: user.id,
    lesson_id: lessonId,
  });

  if (error && error.code !== "23505") {
    console.error("Supabase lesson progress insert error", error);
    return { message: "Não foi possível concluir a aula." };
  }

  revalidatePath(`/cursos/${courseId}`);
  revalidatePath(
    `/cursos/${courseId}/modulos/${moduleId}/aulas/${lessonId}`,
  );

  return { message: "Aula concluída com sucesso.", success: true };
}
