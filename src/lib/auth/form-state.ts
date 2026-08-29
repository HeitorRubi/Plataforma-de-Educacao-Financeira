export type FieldErrors = Partial<
  Record<"fullName" | "email" | "password" | "confirmPassword", string>
>;

export type FormState = {
  message: string;
  errors?: FieldErrors;
  success?: boolean;
};

export const initialFormState: FormState = { message: "" };
