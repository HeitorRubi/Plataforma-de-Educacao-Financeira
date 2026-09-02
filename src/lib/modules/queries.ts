import "server-only";

import { requireUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/courses/queries";
import { isValidCourseId } from "@/lib/courses/validation";
import type { CourseModule } from "@/lib/modules/types";
import { isValidModuleId } from "@/lib/modules/validation";
import { createClient } from "@/lib/supabase/server";

const MODULE_COLUMNS =
  "id, course_id, title, description, position, created_at, updated_at";

function logModuleQueryError(operation: string, error: unknown) {
  console.error(`Supabase modules ${operation} error`, error);
}

export async function listAdminModules(
  courseId: string,
): Promise<CourseModule[]> {
  await requireAdmin();

  if (!isValidCourseId(courseId)) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select(MODULE_COLUMNS)
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (error) {
    logModuleQueryError("list admin", error);
    throw new Error("Não foi possível carregar os módulos do curso.");
  }

  return (data ?? []) as CourseModule[];
}

export async function getAdminModule(
  courseId: string,
  moduleId: string,
): Promise<CourseModule | null> {
  await requireAdmin();

  if (!isValidCourseId(courseId) || !isValidModuleId(moduleId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select(MODULE_COLUMNS)
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    logModuleQueryError("read admin", error);
    throw new Error("Não foi possível carregar o módulo.");
  }

  return data as CourseModule | null;
}

export async function listPublishedCourseModules(
  courseId: string,
): Promise<CourseModule[]> {
  await requireUser();

  if (!isValidCourseId(courseId)) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select(MODULE_COLUMNS)
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (error) {
    logModuleQueryError("list published", error);
    throw new Error("Não foi possível carregar os módulos publicados.");
  }

  return (data ?? []) as CourseModule[];
}
