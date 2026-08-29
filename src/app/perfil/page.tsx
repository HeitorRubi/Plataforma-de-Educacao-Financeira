import { AuthenticatedHeader } from "@/components/auth/authenticated-header";
import { ProfileForm } from "@/components/auth/profile-form";
import { requireUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireUser();
  const displayName = user.profile.full_name ?? "Usuário";

  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthenticatedHeader fullName={displayName} role={user.profile.role} />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold text-emerald-800">Perfil</p>
        <h1 className="mt-3 text-3xl font-bold">Dados da conta</h1>

        <section className="mt-8 border-t border-neutral-200 pt-8">
          <div className="mb-6">
            <p className="text-sm text-neutral-500">E-mail</p>
            <p className="mt-1 break-words font-medium">{user.email}</p>
          </div>

          <ProfileForm fullName={user.profile.full_name ?? ""} />
        </section>
      </main>
    </div>
  );
}
