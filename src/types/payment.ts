export type PaymentMethod = 'TARJETA' | 'APPLE_PAY' | 'GOOGLE_PAY';

export interface CreateAdPaymentIntentRequest {
  habitacionId: number;
  monto: number; // only 30 (30 days) or 54 (60 days)
}

export interface CreateAdPaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
}

export interface AdPayment {
  id: number;
  habitacionId: number;
  monto: number;
  metodoPago: PaymentMethod;
  fechaInicio: string;
  fechaFin: string;
}

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
  TARJETA: 'Tarjeta',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
};
