// Same rules as the backend DTOs (EstudianteRequestDTO / ArrendadorRequestDTO)
const NAME_PATTERN = /^[\p{L} .'-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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