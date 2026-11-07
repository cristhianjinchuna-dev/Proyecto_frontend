// Same rules as the backend DTOs
const NAME_PATTERN = /^[\p{L} .'-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/;

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'El nombre es obligatorio';
  if (value.length > 100) return 'Máximo 100 caracteres';
  if (!NAME_PATTERN.test(value)) return 'Solo letras, espacios, puntos, apóstrofes y guiones';
  return undefined;
}

export function validateEmail(
  email: string,
  { requireEduPe = false }: { requireEduPe?: boolean } = {},
): string | undefined {
  const value = email.trim().toLowerCase();
  if (!value) return 'El correo es obligatorio';
  if (value.length > 150) return 'Máximo 150 caracteres';
  if (!EMAIL_PATTERN.test(value)) return 'Ingresa un correo válido';
  if (requireEduPe && !value.endsWith('.edu.pe')) {
    return 'Debe ser tu correo universitario (.edu.pe)';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 8 || password.length > 64) return 'Debe tener entre 8 y 64 caracteres';
  if (!/[A-Z]/.test(password)) return 'Incluye al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Incluye al menos una minúscula';
  if (!/\d/.test(password)) return 'Incluye al menos un número';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Incluye al menos un símbolo';
  return undefined;
}

// Required text with a max length (e.g. room address: 255)
export function validateRequiredText(
  text: string,
  emptyMessage: string,
  maxLength: number,
): string | undefined {
  const value = text.trim();
  if (!value) return emptyMessage;
  if (value.length > maxLength) return `Máximo ${maxLength} caracteres`;
  return undefined;
}

// Image / DNI URLs (ImagenRequestDTO: http(s)://, max 500)
export function validateUrl(
  url: string,
  { required = true, maxLength = 500 }: { required?: boolean; maxLength?: number } = {},
): string | undefined {
  const value = url.trim();
  if (!value) return required ? 'La URL es obligatoria' : undefined;
  if (value.length > maxLength) return `Máximo ${maxLength} caracteres`;
  if (!URL_PATTERN.test(value)) return 'Debe empezar con http:// o https://';
  return undefined;
}

// Price (> 0) and area (integer > 0)
export function validatePositiveNumber(
  raw: string,
  emptyMessage: string,
  { integer = false }: { integer?: boolean } = {},
): string | undefined {
  const value = raw.trim();
  if (!value) return emptyMessage;
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Debe ser un número';
  if (number <= 0) return 'Debe ser mayor a cero';
  if (integer && !Number.isInteger(number)) return 'Debe ser un número entero';
  return undefined;
}