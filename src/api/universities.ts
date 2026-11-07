import { api } from './client';
import type { CreateUniversityRequest, University } from '../types/university';

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

// EP 038 - POST /universidades (ADMIN only, 201)
export async function createUniversity(body: CreateUniversityRequest): Promise<University> {
  const { data } = await api.post<University>('/universidades', body);
  return data;
}

// EP 039 - DELETE /universidades/{id} (ADMIN only, 204)
export async function deleteUniversity(id: number): Promise<void> {
  await api.delete(`/universidades/${id}`);
}
