import type { Metadata } from "next";

import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { requireUser } from "@/lib/auth/session";
import { listChatSessions } from "@/lib/chat-history/queries";

export const metadata: Metadata = {
  title: "Assistente educacional | Plataforma Financeira",
  description: "Assistente baseado nos conteúdos publicados da plataforma.",
};

export default async function ChatPage() {
  const [user, sessions] = await Promise.all([
    requireUser(),
    listChatSessions(),
  ]);
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="max-w-3xl border-b border-neutral-200 pb-8">
          <p className="text-sm font-semibold text-emerald-800">
            Assistente educacional
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Pergunte sobre os cursos
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
            Consulte conceitos apresentados nas aulas publicadas, confira as
            referências e retome suas conversas anteriores.
          </p>
        </div>

        <ChatInterface initialSessions={sessions} />
      </main>
    </div>
  );
}
