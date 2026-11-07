import { api } from './client';
import type { University } from '../types/university';

// EP 001 - GET /universidades (public, non-paginated list)
export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  const { data } = await api.get<University[]>('/universidades', { signal });
  return data;
}

// EP 013 - GET /universidades/{id} (public)
export async function getUniversityById(id: number, signal?: AbortSignal): Promise<University> {
  const { data } = await api.get<University>(`/universidades/${id}`, { signal });
  return data;
}