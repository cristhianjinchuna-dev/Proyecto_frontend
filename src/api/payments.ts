import { api } from './client';
import type { AdPayment, CreateAdPaymentRequest } from '../types/payment';

// EP 034 - POST /pagos-publicidad (ARRENDADOR, owner of the room). Highlights the room.
export async function createAdPayment(body: CreateAdPaymentRequest): Promise<AdPayment> {
  const { data } = await api.post<AdPayment>('/pagos-publicidad', body);
  return data;
}

// EP 035 - GET /pagos-publicidad (ARRENDADOR). Only the payments of HIS rooms, not paginated.
export async function getMyAdPayments(signal?: AbortSignal): Promise<AdPayment[]> {
  const { data } = await api.get<AdPayment[]>('/pagos-publicidad', { signal });
  return data;
}
