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