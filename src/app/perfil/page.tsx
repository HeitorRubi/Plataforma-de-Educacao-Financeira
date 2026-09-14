import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { ProfileForm } from "@/components/auth/profile-form";
import { requireUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireUser();
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="app-shell">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="page-intro">
          <p className="eyebrow">Perfil</p>
          <h1 className="page-title">Dados da conta</h1>
          <p className="page-description">
            Mantenha seu nome de exibição atualizado.
          </p>
        </div>

        <section className="content-panel mt-8 p-6 sm:p-8">
          <div className="mb-6 border-b border-neutral-200 pb-6">
            <p className="text-sm text-neutral-500">E-mail</p>
            <p className="mt-1 break-words font-medium">{user.email}</p>
          </div>

          <ProfileForm fullName={user.profile.full_name ?? ""} />
        </section>
      </main>
    </div>
  );
}
