export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ModuleFieldErrors = Partial<
  Record<"title" | "description", string>
>;

export type ModuleFormState = {
  message: string;
  errors?: ModuleFieldErrors;
  success?: boolean;
};

export type ModuleOrderState = {
  message: string;
  success?: boolean;
};

export type ModuleDirection = "up" | "down";

export const initialModuleFormState: ModuleFormState = { message: "" };
export const initialModuleOrderState: ModuleOrderState = { message: "" };
