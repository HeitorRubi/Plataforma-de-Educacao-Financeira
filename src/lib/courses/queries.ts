import "server-only";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import type { Course } from "@/lib/courses/types";
import { isValidCourseId } from "@/lib/courses/validation";
import { createClient } from "@/lib/supabase/server";

const COURSE_COLUMNS =
  "id, title, description, is_published, created_at, updated_at";

function logCourseQueryError(operation: string, error: unknown) {
  console.error(`Supabase courses ${operation} error`, error);
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.profile.role !== "ADMIN") {
    redirect("/area-autenticada");
  }

  return user;
}

export async function listPublishedCourses(): Promise<Course[]> {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    logCourseQueryError("list published", error);
    throw new Error("Não foi possível carregar os cursos publicados.");
  }

  return (data ?? []) as Course[];
}

export async function getPublishedCourse(id: string): Promise<Course | null> {
  await requireUser();

  if (!isValidCourseId(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    logCourseQueryError("read published", error);
    throw new Error("Não foi possível carregar o curso.");
  }

  return data as Course | null;
}

export async function listAdminCourses(): Promise<Course[]> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) {
    logCourseQueryError("list admin", error);
    throw new Error("Não foi possível carregar os cursos da administração.");
  }

  return (data ?? []) as Course[];
}

export async function getAdminCourse(id: string): Promise<Course | null> {
  await requireAdmin();

  if (!isValidCourseId(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logCourseQueryError("read admin", error);
    throw new Error("Não foi possível carregar o curso da administração.");
  }

  return data as Course | null;
}
