import { api } from './client';
import { toPage } from './pagination';
import type { Landlord, UpdateLandlordRequest } from '../types/landlord';
import type { Page, PageParams } from '../types/page';
import type { Room } from '../types/room';

// EP 014 - GET /arrendadores/{id} (any logged-in user)
export async function getLandlord(id: number, signal?: AbortSignal): Promise<Landlord> {
  const { data } = await api.get<Landlord>(`/arrendadores/${id}`, { signal });
  return data;
}

// EP 015 - PUT /arrendadores/{id} (ARRENDADOR, own profile only)
export async function updateLandlord(id: number, body: UpdateLandlordRequest): Promise<Landlord> {
  const { data } = await api.put<Landlord>(`/arrendadores/${id}`, body);
  return data;
}

// NEW - GET /arrendadores/{id}/habitaciones (landlord's rooms, newest first)
export async function getLandlordRooms(
  id: number,
  params: PageParams,
  signal?: AbortSignal,
): Promise<Page<Room>> {
  const { data } = await api.get(`/arrendadores/${id}/habitaciones`, { params, signal });
  return toPage<Room>(data);
}

// NEW - GET /arrendadores (ADMIN only, paginated). Added to the backend so the admin can find landlords.
export async function getLandlords(params: PageParams, signal?: AbortSignal): Promise<Page<Landlord>> {
  const { data } = await api.get('/arrendadores', { params, signal });
  return toPage<Landlord>(data);
}

// EP 036 - PATCH /arrendadores/{id}/verificar (ADMIN only, no body)
export async function verifyLandlord(id: number): Promise<Landlord> {
  const { data } = await api.patch<Landlord>(`/arrendadores/${id}/verificar`);
  return data;
}

// EP 040 - DELETE /arrendadores/{id} (the landlord himself or ADMIN, 204)
export async function deleteLandlord(id: number): Promise<void> {
  await api.delete(`/arrendadores/${id}`);
}
