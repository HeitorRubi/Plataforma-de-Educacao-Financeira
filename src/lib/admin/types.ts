export type AdminContentTotals = {
  courses: number;
  publishedCourses: number;
  modules: number;
  lessons: number;
  publishedLessons: number;
  sources: number;
};

export type AdminCourseOverview = {
  id: string;
  title: string;
  isPublished: boolean;
  updatedAt: string;
  moduleCount: number;
  lessonCount: number;
  sourceCount: number;
};

export type AdminOverview = {
  totals: AdminContentTotals;
  courses: AdminCourseOverview[];
};
