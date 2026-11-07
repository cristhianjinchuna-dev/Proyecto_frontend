import { api } from './client';
import { toPage } from './pagination';
import type { Page, PageParams } from '../types/page';
import type { Room, RoomDetail, RoomImage } from '../types/room';

// EP 008 - GET /habitaciones (public, paginated, featured first)
export async function getRooms(params: PageParams, signal?: AbortSignal): Promise<Page<Room>> {
  const { data } = await api.get('/habitaciones', { params, signal });
  return toPage<Room>(data);
}

// EP 009 - GET /habitaciones/{id} (public)
export async function getRoomById(id: number, signal?: AbortSignal): Promise<RoomDetail> {
  const { data } = await api.get<RoomDetail>(`/habitaciones/${id}`, { signal });
  return data;
}

// EP 010 - GET /habitaciones/{id}/imagenes (public, non-paginated)
export async function getRoomImages(roomId: number, signal?: AbortSignal): Promise<RoomImage[]> {
  const { data } = await api.get<RoomImage[]>(`/habitaciones/${roomId}/imagenes`, { signal });
  return data;
}