import "server-only";

import type { AdminOverview } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/courses/queries";
import { createClient } from "@/lib/supabase/server";

type CourseRow = {
  id: string;
  title: string;
  is_published: boolean;
  updated_at: string;
};

type ModuleRow = {
  id: string;
  course_id: string;
};

type LessonRow = {
  id: string;
  module_id: string;
  is_published: boolean;
};

type SourceRow = {
  lesson_id: string;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();

  const supabase = await createClient();
  const [coursesResult, modulesResult, lessonsResult, sourcesResult] =
    await Promise.all([
      supabase
        .from("courses")
        .select("id, title, is_published, updated_at")
        .order("updated_at", { ascending: false }),
      supabase.from("modules").select("id, course_id"),
      supabase.from("lessons").select("id, module_id, is_published"),
      supabase.from("lesson_sources").select("lesson_id"),
    ]);

  const failedQuery = [
    ["courses", coursesResult.error],
    ["modules", modulesResult.error],
    ["lessons", lessonsResult.error],
    ["lesson_sources", sourcesResult.error],
  ].find(([, error]) => error);

  if (failedQuery) {
    console.error(`Supabase admin overview ${failedQuery[0]} error`, failedQuery[1]);
    throw new Error("Não foi possível carregar o painel administrativo.");
  }

  const courses = (coursesResult.data ?? []) as CourseRow[];
  const modules = (modulesResult.data ?? []) as ModuleRow[];
  const lessons = (lessonsResult.data ?? []) as LessonRow[];
  const sources = (sourcesResult.data ?? []) as SourceRow[];
  const courseCounts = new Map(
    courses.map((course) => [
      course.id,
      { moduleCount: 0, lessonCount: 0, sourceCount: 0 },
    ]),
  );
  const moduleCourseIds = new Map<string, string>();
  const lessonCourseIds = new Map<string, string>();

  for (const courseModule of modules) {
    moduleCourseIds.set(courseModule.id, courseModule.course_id);
    const counts = courseCounts.get(courseModule.course_id);

    if (counts) {
      counts.moduleCount += 1;
    }
  }

  for (const lesson of lessons) {
    const courseId = moduleCourseIds.get(lesson.module_id);

    if (!courseId) {
      continue;
    }

    lessonCourseIds.set(lesson.id, courseId);
    const counts = courseCounts.get(courseId);

    if (counts) {
      counts.lessonCount += 1;
    }
  }

  for (const source of sources) {
    const courseId = lessonCourseIds.get(source.lesson_id);
    const counts = courseId ? courseCounts.get(courseId) : undefined;

    if (counts) {
      counts.sourceCount += 1;
    }
  }

  return {
    totals: {
      courses: courses.length,
      publishedCourses: courses.filter((course) => course.is_published).length,
      modules: modules.length,
      lessons: lessons.length,
      publishedLessons: lessons.filter((lesson) => lesson.is_published).length,
      sources: sources.length,
    },
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      isPublished: course.is_published,
      updatedAt: course.updated_at,
      ...(courseCounts.get(course.id) ?? {
        moduleCount: 0,
        lessonCount: 0,
        sourceCount: 0,
      }),
    })),
  };
}
