import { api } from './client';
import type { Universidad } from '../types/universidad';

// EP 001 - GET /universidades (público, lista sin paginar)
export async function getUniversidades(): Promise<Universidad[]> {
  const { data } = await api.get<Universidad[]>('/universidades');
  return data;
}