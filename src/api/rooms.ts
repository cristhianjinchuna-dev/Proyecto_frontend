import { api } from './client';
import { toPage } from './pagination';
import type { Page, PageParams } from '../types/page';
import type { NearbyRoomsParams, Room, RoomDetail, RoomImage, RoomRequest } from '../types/room';

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

// EP 012 - GET /habitaciones/cercanas (public, paginated, featured first then closest)
export async function getNearbyRooms(
  params: NearbyRoomsParams,
  signal?: AbortSignal,
): Promise<Page<Room>> {
  const { data } = await api.get('/habitaciones/cercanas', { params, signal });
  return toPage<Room>(data);
}

// EP 016 - POST /habitaciones (verified ARRENDADOR)
export async function createRoom(body: RoomRequest): Promise<Room> {
  const { data } = await api.post<Room>('/habitaciones', body);
  return data;
}

// EP 019 - PUT /habitaciones/{id} (owner ARRENDADOR, all fields are sent)
export async function updateRoom(id: number, body: RoomRequest): Promise<Room> {
  const { data } = await api.put<Room>(`/habitaciones/${id}`, body);
  return data;
}

// EP 020 - DELETE /habitaciones/{id} (owner ARRENDADOR, 204 no body)
export async function deleteRoom(id: number): Promise<void> {
  await api.delete(`/habitaciones/${id}`);
}