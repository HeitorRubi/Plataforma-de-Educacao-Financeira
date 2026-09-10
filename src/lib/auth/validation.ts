export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

export function validateFullName(fullName: string) {
  if (fullName.length < FULL_NAME_MIN_LENGTH) {
    return `Informe um nome com pelo menos ${FULL_NAME_MIN_LENGTH} caracteres.`;
  }

  if (fullName.length > FULL_NAME_MAX_LENGTH) {
    return `O nome deve possuir no máximo ${FULL_NAME_MAX_LENGTH} caracteres.`;
  }

  return null;
}

export function validateEmail(email: string) {
  if (email.length > EMAIL_MAX_LENGTH) {
    return `O e-mail deve possuir no máximo ${EMAIL_MAX_LENGTH} caracteres.`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um e-mail válido.";
  }

  return null;
}
