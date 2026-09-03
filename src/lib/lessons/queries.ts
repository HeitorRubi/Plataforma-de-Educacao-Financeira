import "server-only";

import { requireUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/courses/queries";
import type {
  Lesson,
  LessonSource,
  LessonSummary,
} from "@/lib/lessons/types";
import {
  isValidLessonId,
  isValidSourceId,
} from "@/lib/lessons/validation";
import { isValidModuleId } from "@/lib/modules/validation";
import { createClient } from "@/lib/supabase/server";

const LESSON_COLUMNS =
  "id, module_id, title, content, position, is_published, created_at, updated_at";
const LESSON_SUMMARY_COLUMNS =
  "id, module_id, title, position, is_published, created_at, updated_at";
const SOURCE_COLUMNS =
  "id, lesson_id, title, author, url, publication_year, position, created_at, updated_at";

function logLessonQueryError(operation: string, error: unknown) {
  console.error(`Supabase lessons ${operation} error`, error);
}

export async function listAdminLessons(
  moduleId: string,
): Promise<LessonSummary[]> {
  await requireAdmin();

  if (!isValidModuleId(moduleId)) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SUMMARY_COLUMNS)
    .eq("module_id", moduleId)
    .order("position", { ascending: true });

  if (error) {
    logLessonQueryError("list admin", error);
    throw new Error("Não foi possível carregar as aulas do módulo.");
  }

  return (data ?? []) as LessonSummary[];
}

export async function getAdminLesson(
  moduleId: string,
  lessonId: string,
): Promise<Lesson | null> {
  await requireAdmin();

  if (!isValidModuleId(moduleId) || !isValidLessonId(lessonId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (error) {
    logLessonQueryError("read admin", error);
    throw new Error("Não foi possível carregar a aula.");
  }

  return data as Lesson | null;
}

export async function listAdminLessonSources(
  lessonId: string,
): Promise<LessonSource[]> {
  await requireAdmin();

  if (!isValidLessonId(lessonId)) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_sources")
    .select(SOURCE_COLUMNS)
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true });

  if (error) {
    logLessonQueryError("list admin sources", error);
    throw new Error("Não foi possível carregar as fontes da aula.");
  }

  return (data ?? []) as LessonSource[];
}

export async function getAdminLessonSource(
  lessonId: string,
  sourceId: string,
): Promise<LessonSource | null> {
  await requireAdmin();

  if (!isValidLessonId(lessonId) || !isValidSourceId(sourceId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_sources")
    .select(SOURCE_COLUMNS)
    .eq("id", sourceId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    logLessonQueryError("read admin source", error);
    throw new Error("Não foi possível carregar a fonte.");
  }

  return data as LessonSource | null;
}

export async function listPublishedLessonsForModules(
  moduleIds: string[],
): Promise<LessonSummary[]> {
  await requireUser();

  if (
    moduleIds.length === 0 ||
    moduleIds.some((moduleId) => !isValidModuleId(moduleId))
  ) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SUMMARY_COLUMNS)
    .in("module_id", moduleIds)
    .eq("is_published", true)
    .order("position", { ascending: true });

  if (error) {
    logLessonQueryError("list published", error);
    throw new Error("Não foi possível carregar as aulas publicadas.");
  }

  return (data ?? []) as LessonSummary[];
}

export async function getPublishedLesson(
  moduleId: string,
  lessonId: string,
): Promise<Lesson | null> {
  await requireUser();

  if (!isValidModuleId(moduleId) || !isValidLessonId(lessonId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    logLessonQueryError("read published", error);
    throw new Error("Não foi possível carregar a aula publicada.");
  }

  return data as Lesson | null;
}

export async function listPublishedLessonSources(
  lessonId: string,
): Promise<LessonSource[]> {
  await requireUser();

  if (!isValidLessonId(lessonId)) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_sources")
    .select(SOURCE_COLUMNS)
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true });

  if (error) {
    logLessonQueryError("list published sources", error);
    throw new Error("Não foi possível carregar as fontes da aula.");
  }

  return (data ?? []) as LessonSource[];
}
