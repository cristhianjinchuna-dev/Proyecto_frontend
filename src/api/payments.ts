import { api } from './client';
import type { AdPayment, CreateAdPaymentIntentRequest, CreateAdPaymentIntentResponse } from '../types/payment';

export async function createAdPaymentIntent(
  body: CreateAdPaymentIntentRequest,
): Promise<CreateAdPaymentIntentResponse> {
  const { data } = await api.post<CreateAdPaymentIntentResponse>('/pagos-publicidad/intenciones', body);
  return data;
}

export async function confirmAdPayment(paymentIntentId: string): Promise<AdPayment> {
  const { data } = await api.post<AdPayment>(`/pagos-publicidad/${encodeURIComponent(paymentIntentId)}/confirmar`);
  return data;
}

export async function getMyAdPayments(signal?: AbortSignal): Promise<AdPayment[]> {
  const { data } = await api.get<AdPayment[]>('/pagos-publicidad', { signal });
  return data;
}
