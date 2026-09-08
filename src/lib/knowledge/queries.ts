import "server-only";

import { requireUser } from "@/lib/auth/session";
import { buildKnowledgeChunks } from "@/lib/knowledge/chunking";
import type {
  KnowledgeBase,
  KnowledgeDocument,
} from "@/lib/knowledge/types";
import { createClient } from "@/lib/supabase/server";

const KNOWLEDGE_DOCUMENT_COLUMNS =
  "course_id, course_title, module_id, module_title, module_position, lesson_id, lesson_title, lesson_position, content, lesson_updated_at, sources";

type KnowledgeSourceRow = {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  publication_year: number | null;
  position: number;
};

type KnowledgeDocumentRow = {
  course_id: string;
  course_title: string;
  module_id: string;
  module_title: string;
  module_position: number;
  lesson_id: string;
  lesson_title: string;
  lesson_position: number;
  content: string;
  lesson_updated_at: string;
  sources: KnowledgeSourceRow[] | null;
};

function mapKnowledgeDocument(row: KnowledgeDocumentRow): KnowledgeDocument {
  return {
    courseId: row.course_id,
    courseTitle: row.course_title,
    moduleId: row.module_id,
    moduleTitle: row.module_title,
    modulePosition: row.module_position,
    lessonId: row.lesson_id,
    lessonTitle: row.lesson_title,
    lessonPosition: row.lesson_position,
    content: row.content,
    lessonUpdatedAt: row.lesson_updated_at,
    sources: (row.sources ?? []).map((source) => ({
      id: source.id,
      title: source.title,
      author: source.author,
      url: source.url,
      publicationYear: source.publication_year,
      position: source.position,
    })),
  };
}

export async function listKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select(KNOWLEDGE_DOCUMENT_COLUMNS)
    .order("course_title", { ascending: true })
    .order("module_position", { ascending: true })
    .order("lesson_position", { ascending: true });

  if (error) {
    console.error("Supabase knowledge documents list error", error);
    throw new Error("Não foi possível carregar a base de conhecimento.");
  }

  return ((data ?? []) as KnowledgeDocumentRow[]).map(mapKnowledgeDocument);
}

export async function getKnowledgeBase(): Promise<KnowledgeBase> {
  const documents = await listKnowledgeDocuments();

  return {
    documents,
    chunks: buildKnowledgeChunks(documents),
  };
}
