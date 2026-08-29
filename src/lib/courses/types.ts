export type Course = {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseFieldErrors = Partial<
  Record<"title" | "description", string>
>;

export type CourseFormState = {
  message: string;
  errors?: CourseFieldErrors;
  success?: boolean;
};

export const initialCourseFormState: CourseFormState = { message: "" };
