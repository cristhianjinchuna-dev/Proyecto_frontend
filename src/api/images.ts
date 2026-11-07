import { api } from './client';
import type { CreateImageRequest, RoomImage } from '../types/room';

// EP 017 - POST /habitaciones/{id}/imagenes (owner ARRENDADOR)
export async function addRoomImage(roomId: number, body: CreateImageRequest): Promise<RoomImage> {
  const { data } = await api.post<RoomImage>(`/habitaciones/${roomId}/imagenes`, body);
  return data;
}

// EP 018 - DELETE /imagenes/{id} (owner ARRENDADOR)
export async function deleteImage(imageId: number): Promise<void> {
  await api.delete(`/imagenes/${imageId}`);
}