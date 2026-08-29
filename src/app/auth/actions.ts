"use server";

import type { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FieldErrors, FormState } from "@/lib/auth/form-state";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "A senha deve possuir pelo menos 8 caracteres.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos uma letra e um número.";
  }

  return null;
}

function getAuthErrorMessage(error: AuthError, operation: "login" | "signup") {
  if (operation === "login") {
    return "E-mail ou senha inválidos.";
  }

  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "Não foi possível criar a conta com esse e-mail.";
    case "over_email_send_rate_limit":
      return "Muitas tentativas de envio. Aguarde alguns minutos e tente novamente.";
    case "weak_password":
      return "A senha não atende aos requisitos de segurança.";
    default:
      return "Não foi possível criar a conta. Tente novamente.";
  }
}

function logAuthError(error: AuthError, operation: "login" | "signup") {
  console.error(`Supabase ${operation} error`, {
    code: error.code,
    message: error.message,
    status: error.status,
  });
}

export async function loginAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = readText(formData, "email").trim().toLowerCase();
  const password = readText(formData, "password");
  const errors: FieldErrors = {};

  if (!isValidEmail(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!password) {
    errors.password = "Informe sua senha.";
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logAuthError(error, "login");
    return { message: getAuthErrorMessage(error, "login") };
  }

  redirect("/area-autenticada");
}

export async function signupAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fullName = readText(formData, "fullName").trim();
  const email = readText(formData, "email").trim().toLowerCase();
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");
  const errors: FieldErrors = {};

  if (fullName.length < 2) {
    errors.fullName = "Informe um nome com pelo menos 2 caracteres.";
  }

  if (!isValidEmail(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Revise os campos indicados.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    logAuthError(error, "signup");
    return { message: getAuthErrorMessage(error, "signup") };
  }

  if (!data.session) {
    return {
      message:
        "A conta foi recebida, mas a sessão não foi iniciada. Tente entrar pela tela de login.",
    };
  }

  redirect("/area-autenticada");
}

export async function updateProfileAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fullName = readText(formData, "fullName").trim();

  if (fullName.length < 2) {
    return {
      message: "Revise o nome informado.",
      errors: {
        fullName: "Informe um nome com pelo menos 2 caracteres.",
      },
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims.sub) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", claimsData.claims.sub);

  if (error) {
    return { message: "Não foi possível atualizar o perfil." };
  }

  revalidatePath("/perfil");
  revalidatePath("/area-autenticada");

  return { message: "Perfil atualizado com sucesso.", success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?status=signed-out");
}
