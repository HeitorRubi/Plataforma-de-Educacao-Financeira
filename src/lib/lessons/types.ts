export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LessonSummary = Omit<Lesson, "content">;

export type LessonSource = {
  id: string;
  lesson_id: string;
  title: string;
  author: string | null;
  url: string | null;
  publication_year: number | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type LessonFieldErrors = Partial<Record<"title" | "content", string>>;

export type LessonFormState = {
  message: string;
  errors?: LessonFieldErrors;
  success?: boolean;
};

export type LessonActionState = {
  message: string;
  success?: boolean;
};

export type SourceFieldErrors = Partial<
  Record<"title" | "author" | "url" | "publicationYear", string>
>;

export type SourceFormState = {
  message: string;
  errors?: SourceFieldErrors;
  success?: boolean;
};

export type OrderDirection = "up" | "down";

export const initialLessonFormState: LessonFormState = { message: "" };
export const initialLessonActionState: LessonActionState = { message: "" };
export const initialSourceFormState: SourceFormState = { message: "" };
