import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "USER" | "ADMIN";

type Profile = {
  full_name: string | null;
  role: UserRole;
};

export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims.sub) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", claimsData.claims.sub)
    .single();

  if (error || !data) {
    throw new Error("Não foi possível carregar o perfil do usuário.");
  }

  return {
    id: claimsData.claims.sub,
    email: claimsData.claims.email ?? "",
    profile: data as Profile,
  };
});
