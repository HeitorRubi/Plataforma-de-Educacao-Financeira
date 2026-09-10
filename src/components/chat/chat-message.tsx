import { ChatReferenceList } from "@/components/chat/chat-reference-list";
import { MarkdownContent } from "@/components/lessons/markdown-content";
import type { ChatMessage as ChatMessageData } from "@/lib/chat-history/types";
import type { RagAnswerStatus } from "@/lib/rag/types";

const statusContent: Record<
  RagAnswerStatus,
  { label: string; className: string }
> = {
  answered: {
    label: "Resposta fundamentada",
    className: "text-emerald-800",
  },
  insufficient_context: {
    label: "Contexto insuficiente",
    className: "text-amber-800",
  },
  restricted: {
    label: "Solicitação limitada",
    className: "text-amber-800",
  },
};

export function ChatMessage({ message }: { message: ChatMessageData }) {
  if (message.role === "USER") {
    return (
      <article className="border-l-4 border-neutral-300 pl-5">
        <p className="text-xs font-semibold uppercase text-neutral-500">Você</p>
        <p className="mt-2 break-words text-lg leading-7 text-neutral-800">
          {message.content}
        </p>
      </article>
    );
  }

  const status = message.status ? statusContent[message.status] : null;

  return (
    <article className="border-y border-neutral-200 py-7">
      {status && (
        <p className={`text-sm font-semibold ${status.className}`}>
          {status.label}
        </p>
      )}
      <div className="mt-3 break-words">
        <MarkdownContent content={message.content} />
      </div>
      <ChatReferenceList references={message.references} />
    </article>
  );
}
