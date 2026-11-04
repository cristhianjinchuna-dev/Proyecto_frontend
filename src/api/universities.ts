import { api } from './client';
import type { University } from '../types/university';

// EP 001 - GET /universidades (public, non-paginated list)
export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  const { data } = await api.get<University[]>('/universidades', { signal });
  return data;
}