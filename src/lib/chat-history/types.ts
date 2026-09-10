import type {
  RagAnswer,
  RagAnswerStatus,
  RagReference,
} from "@/lib/rag/types";

export type ChatSessionSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  status: RagAnswerStatus | null;
  references: RagReference[];
  position: number;
  createdAt: string;
};

export type ChatSession = ChatSessionSummary & {
  messages: ChatMessage[];
};

export type PersistedChatAnswer = RagAnswer & {
  session: ChatSession;
};
