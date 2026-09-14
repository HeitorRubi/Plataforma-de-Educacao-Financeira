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
      <article className="flex gap-3 rounded-md bg-blue-50 p-4 sm:p-5">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-blue-700 text-white">
          <UserRound aria-hidden="true" size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-blue-800">Você</p>
          <p className="mt-2 break-words text-lg leading-7 text-neutral-800">
            {message.content}
          </p>
        </div>
      </article>
    );
  }

  const status = message.status ? statusContent[message.status] : null;

  return (
    <article className="border-b border-neutral-200 pb-7">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-700">
        <span className="grid size-8 place-items-center rounded-md bg-emerald-800 text-white">
          <Bot aria-hidden="true" size={17} />
        </span>
        Assistente
      </div>
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
import { Bot, UserRound } from "lucide-react";
