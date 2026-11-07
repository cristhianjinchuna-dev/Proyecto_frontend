import { api } from './client';
import type { StudentProfile } from '../types/student';

// EP 025 - GET /estudiantes/{id}/perfil (ARRENDADOR only)
export async function getStudentProfile(id: number, signal?: AbortSignal): Promise<StudentProfile> {
  const { data } = await api.get<StudentProfile>(`/estudiantes/${id}/perfil`, { signal });
  return data;
}