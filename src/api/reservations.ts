import { api } from './client';
import { toPage } from './pagination';
import type { Page, PageParams } from '../types/page';
import type { CreateReservationRequest, Reservation } from '../types/reservation';

// EP 021 - POST /reservas (ESTUDIANTE)
export async function createReservation(body: CreateReservationRequest): Promise<Reservation> {
  const { data } = await api.post<Reservation>('/reservas', body);
  return data;
}

// EP 022 - GET /reservas (student: mine, landlord: my rooms', admin: all). Paginated, newest first
export async function getReservations(params: PageParams, signal?: AbortSignal): Promise<Page<Reservation>> {
  const { data } = await api.get('/reservas', { params, signal });
  return toPage<Reservation>(data);
}

// EP 023 - GET /reservas/{id} (student owner or landlord owner of the room)
export async function getReservationById(id: number, signal?: AbortSignal): Promise<Reservation> {
  const { data } = await api.get<Reservation>(`/reservas/${id}`, { signal });
  return data;
}

// EP 024 - PATCH /reservas/{id}/cancelar (student owner, only PENDIENTE)
export async function cancelReservation(id: number): Promise<Reservation> {
  const { data } = await api.patch<Reservation>(`/reservas/${id}/cancelar`);
  return data;
}

// EP 026 - PATCH /reservas/{id}/confirmar (landlord owner of the room, only PENDIENTE)
export async function confirmReservation(id: number): Promise<Reservation> {
  const { data } = await api.patch<Reservation>(`/reservas/${id}/confirmar`);
  return data;
}