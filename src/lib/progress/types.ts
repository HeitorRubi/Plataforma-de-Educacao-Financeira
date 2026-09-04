export type LessonProgress = {
  lesson_id: string;
  completed_at: string;
};

export type CourseProgress = {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
};

export type ProgressActionState = {
  message: string;
  success?: boolean;
};

export const initialProgressActionState: ProgressActionState = { message: "" };
