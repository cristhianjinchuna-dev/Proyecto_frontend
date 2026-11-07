import { api } from './client';
import { toPage } from './pagination';
import type { Page, PageParams } from '../types/page';
import type { CreateRatingRequest, Rating } from '../types/rating';

// EP 011 - GET /habitaciones/{id}/calificaciones (public, paginated, newest first)
export async function getRoomRatings(
  roomId: number,
  params: PageParams,
  signal?: AbortSignal,
): Promise<Page<Rating>> {
  const { data } = await api.get(`/habitaciones/${roomId}/calificaciones`, { params, signal });
  return toPage<Rating>(data);
}

// EP 027 - POST /calificaciones (student owner of a CONFIRMADO reservation, only once)
export async function createRating(body: CreateRatingRequest): Promise<Rating> {
  const { data } = await api.post<Rating>('/calificaciones', body);
  return data;
}

// EP 028 - GET /calificaciones/{id} (logged in)
export async function getRatingById(id: number, signal?: AbortSignal): Promise<Rating> {
  const { data } = await api.get<Rating>(`/calificaciones/${id}`, { signal });
  return data;
}

// EP 029 - GET /estudiantes/{id}/calificaciones (logged in, paginated, newest first)
export async function getStudentRatings(
  studentId: number,
  params: PageParams,
  signal?: AbortSignal,
): Promise<Page<Rating>> {
  const { data } = await api.get(`/estudiantes/${studentId}/calificaciones`, { params, signal });
  return toPage<Rating>(data);
}

// EP 030 - DELETE /calificaciones/{id} (author or ADMIN, 204)
export async function deleteRating(id: number): Promise<void> {
  await api.delete(`/calificaciones/${id}`);
}