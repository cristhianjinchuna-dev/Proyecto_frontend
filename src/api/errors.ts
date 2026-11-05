import axios from 'axios';

// Shape of ErrorResponseDTO returned by the backend
interface ApiErrorBody {
  message?: string;
  errores?: Record<string, string>;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Revisa los datos ingresados',
  401: 'Tu sesión expiró, vuelve a iniciar sesión',
  403: 'No tienes permiso para realizar esta acción',
  404: 'No encontramos lo que buscas',
  409: 'Ya existe un registro con esos datos',
  500: 'Error del servidor, intenta nuevamente más tarde',
};

export function getErrorStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
}

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Ocurrió un error inesperado';
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder';
  if (!error.response) return 'No se pudo conectar con el servidor';

  const body = error.response.data as ApiErrorBody | undefined;
  return body?.message ?? STATUS_MESSAGES[error.response.status] ?? 'Ocurrió un error inesperado';
}

// 400 validation errors: { errores: { campo: "mensaje" } }
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {};
  const body = error.response?.data as ApiErrorBody | undefined;
  return body?.errores ?? {};
}


// Maps backend field names (nombre, correo...) to form field names (name, email...)
export function mapFieldErrors<T>(
  error: unknown,
  fieldMap: Record<string, keyof T>,
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {};
  for (const [serverField, message] of Object.entries(getFieldErrors(error))) {
    const field = fieldMap[serverField];
    if (field) result[field] = message;
  }
  return result;
}