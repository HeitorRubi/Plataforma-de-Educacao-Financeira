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
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="page-intro max-w-3xl">
          <p className="eyebrow">
            Assistente educacional
          </p>
          <h1 className="page-title">
            Pergunte sobre os cursos
          </h1>
          <p className="page-description">
            Consulte conceitos apresentados nas aulas publicadas, confira as
            referências e retome suas conversas anteriores.
          </p>
        </div>

        <ChatInterface initialSessions={sessions} />
      </main>
    </div>
  );
}
