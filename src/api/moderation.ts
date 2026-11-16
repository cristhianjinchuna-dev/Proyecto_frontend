import { api } from './client';

// Moderation tools (ADMIN only). Nothing is deleted: suspend / hide can be undone

// PATCH /usuarios/{id}/suspension - a suspended account can't log in; a suspended landlord's rooms disappear
export async function setUserSuspension(id: number, suspendido: boolean, motivo?: string): Promise<void> {
  await api.patch(`/usuarios/${id}/suspension`, { suspendido, motivo: motivo || undefined });
}

// PATCH /habitaciones/{id}/visibilidad - a hidden room is not listed and can't be booked
export async function setRoomVisibility(id: number, oculta: boolean, motivo?: string): Promise<void> {
  await api.patch(`/habitaciones/${id}/visibilidad`, { oculta, motivo: motivo || undefined });
}
