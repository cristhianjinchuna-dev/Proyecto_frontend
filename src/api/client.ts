import axios from 'axios';

// Instancia única de axios para todo el proyecto
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080/api/v1
  headers: { 'Content-Type': 'application/json' },
});

// Antes de CADA petición: si hay token guardado, lo agrega al header.
// (Por ahora no hay token; lo usaremos desde el login, EP 004)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Saca un mensaje de error legible de cualquier error de axios
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor';
    const data = error.response.data as { message?: string } | undefined;
    return data?.message ?? `Error ${error.response.status}`;
  }
  return 'Ocurrió un error inesperado';
}