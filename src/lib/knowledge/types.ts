export type KnowledgeSource = {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  publicationYear: number | null;
  position: number;
};

export type KnowledgeDocument = {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  modulePosition: number;
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  content: string;
  lessonUpdatedAt: string;
  sources: KnowledgeSource[];
};

export type KnowledgeChunk = {
  id: string;
  lessonId: string;
  position: number;
  content: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonTitle: string;
  sources: KnowledgeSource[];
};

export type KnowledgeBase = {
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
};
