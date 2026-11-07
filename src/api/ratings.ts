import { api } from './client';
import { toPage } from './pagination';
import type { Page, PageParams } from '../types/page';
import type { Rating } from '../types/rating';

// EP 011 - GET /habitaciones/{id}/calificaciones (public, paginated, newest first)
export async function getRoomRatings(
  roomId: number,
  params: PageParams,
  signal?: AbortSignal,
): Promise<Page<Rating>> {
  const { data } = await api.get(`/habitaciones/${roomId}/calificaciones`, { params, signal });
  return toPage<Rating>(data);
}