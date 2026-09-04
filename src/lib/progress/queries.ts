import "server-only";

import { requireUser } from "@/lib/auth/session";
import { isValidLessonId } from "@/lib/lessons/validation";
import type { CourseProgress, LessonProgress } from "@/lib/progress/types";
import { createClient } from "@/lib/supabase/server";

const PROGRESS_COLUMNS = "lesson_id, completed_at";

export async function listUserLessonProgress(
  lessonIds: string[],
): Promise<LessonProgress[]> {
  const user = await requireUser();
  const uniqueLessonIds = [...new Set(lessonIds)];

  if (
    uniqueLessonIds.length === 0 ||
    uniqueLessonIds.some((lessonId) => !isValidLessonId(lessonId))
  ) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select(PROGRESS_COLUMNS)
    .eq("user_id", user.id)
    .in("lesson_id", uniqueLessonIds);

  if (error) {
    console.error("Supabase lesson progress list error", error);
    throw new Error("Não foi possível carregar o progresso das aulas.");
  }

  return (data ?? []) as LessonProgress[];
}

export function calculateCourseProgress(
  lessonIds: string[],
  progress: LessonProgress[],
): CourseProgress {
  const publishedLessonIds = new Set(lessonIds);
  const completedLessonIds = new Set(
    progress
      .map((item) => item.lesson_id)
      .filter((lessonId) => publishedLessonIds.has(lessonId)),
  );
  const totalLessons = publishedLessonIds.size;
  const completedLessons = completedLessonIds.size;

  return {
    completedLessons,
    totalLessons,
    percentage:
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100),
  };
}
