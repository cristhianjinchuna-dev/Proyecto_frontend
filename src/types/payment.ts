export type PaymentMethod = 'TARJETA_DEBITO' | 'TARJETA_CREDITO';

// EP 034 - body (PagoPublicidadRequestDTO)
export interface CreateAdPaymentRequest {
  habitacionId: number;
  monto: number; // only 30 (30 days) or 54 (60 days)
  metodoPago: PaymentMethod;
}

// EP 034 / EP 035 - PagoPublicidadResponseDTO
export interface AdPayment {
  id: number;
  habitacionId: number;
  monto: number;
  metodoPago: PaymentMethod;
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string; // yyyy-MM-dd
}

// The 2 plans the backend accepts (the amount decides the duration)
export interface AdPlan {
  amount: number;
  days: number;
  label: string;
}

export const AD_PLANS: AdPlan[] = [
  { amount: 30, days: 30, label: '30 días' },
  { amount: 54, days: 60, label: '60 días' },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TARJETA_DEBITO: 'Tarjeta de débito',
  TARJETA_CREDITO: 'Tarjeta de crédito',
};
