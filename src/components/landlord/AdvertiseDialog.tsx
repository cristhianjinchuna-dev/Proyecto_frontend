import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Sparkles } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';
import { confirmAdPayment, createAdPaymentIntent } from '../../api/payments';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { AD_PLANS, type AdPayment, type CreateAdPaymentIntentResponse } from '../../types/payment';
import type { Room } from '../../types/room';
import { formatPrice } from '../../utils/format';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface AdvertiseDialogProps {
  room: Room | null;
  onClose: () => void;
  onPaid: (payment: AdPayment) => void;
}

export function AdvertiseDialog({ room, onClose, onPaid }: AdvertiseDialogProps) {
  if (!room) return null;
  return <AdvertiseDialogContent room={room} onClose={onClose} onPaid={onPaid} />;
}

interface AdvertiseDialogContentProps {
  room: Room;
  onClose: () => void;
  onPaid: (payment: AdPayment) => void;
}

function AdvertiseDialogContent({ room, onClose, onPaid }: AdvertiseDialogContentProps) {
  const [amount, setAmount] = useState(AD_PLANS[0].amount);
  const [intent, setIntent] = useState<CreateAdPaymentIntentResponse | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !starting && !intent) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [starting, intent, onClose]);

  async function startPayment() {
    setStarting(true);
    setError(null);
    try {
      setIntent(await createAdPaymentIntent({ habitacionId: room.id, monto: amount }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !starting && !intent && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="advertise-title"
        className="max-h-[90vh] w-full max-w-4xl space-y-6 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="advertise-title" className="text-lg font-semibold text-gray-900">Destacar habitación</h2>
            <p className="mt-1 text-sm text-gray-600">{room.direccion}</p>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {!stripePromise && <Alert variant="error">Falta configurar VITE_STRIPE_PUBLISHABLE_KEY para habilitar pagos.</Alert>}

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-5" aria-labelledby="ad-plan-title">
            <div>
              <h3 id="ad-plan-title" className="text-base font-semibold text-gray-900">Elige un plan</h3>
              <p className="mt-1 text-sm text-gray-500">Tu habitación aparecerá primero en las búsquedas.</p>
            </div>

            <fieldset className="space-y-2" disabled={Boolean(intent)}>
              <legend className="sr-only">Plan de publicidad</legend>
              {AD_PLANS.map((plan) => (
                <label
                  key={plan.amount}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 ${
                    amount === plan.amount ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      checked={amount === plan.amount}
                      onChange={() => setAmount(plan.amount)}
                    />
                    <span className="font-medium text-gray-900">{plan.label}</span>
                  </span>
                  <span className="font-semibold text-gray-900">{formatPrice(plan.amount)}</span>
                </label>
              ))}
            </fieldset>

            {room.esDestacada && (
              <p className="text-xs text-gray-500">La nueva promoción se sumará al historial de publicidad.</p>
            )}
          </section>

          <section className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-5" aria-labelledby="ad-payment-title">
            <div>
              <h3 id="ad-payment-title" className="text-base font-semibold text-gray-900">Pago seguro con Stripe</h3>
              <p className="mt-1 text-sm text-gray-500">Total: {formatPrice(amount)}</p>
            </div>

            {intent && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
                <StripePaymentForm
                  paymentIntentId={intent.paymentIntentId}
                  onPaid={onPaid}
                  onError={setError}
                  onCancel={() => { setIntent(null); setError(null); }}
                />
              </Elements>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Paga con Apple Pay, Google Pay o una tarjeta. La habitación se destacará al confirmarse el pago.
                </p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button variant="secondary" onClick={onClose} disabled={starting}>Cancelar</Button>
                  <Button onClick={startPayment} loading={starting} disabled={!stripePromise}>
                    {starting ? 'Preparando pago...' : 'Continuar al pago'}
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

interface StripePaymentFormProps {
  paymentIntentId: string;
  onPaid: (payment: AdPayment) => void;
  onError: (message: string | null) => void;
  onCancel: () => void;
}

function StripePaymentForm({ paymentIntentId, onPaid, onError, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(false);

  async function submitPayment(onWalletFailure?: () => void) {
    if (!stripe || !elements) return;
    setPaying(true);
    onError(null);
    let paymentSucceeded = false;
    try {
      const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });
      if (result.error) throw new Error(result.error.message ?? 'Stripe no pudo confirmar el pago.');
      if (result.paymentIntent?.status !== 'succeeded') {
        throw new Error('El pago todavía no está confirmado. Inténtalo de nuevo en unos momentos.');
      }
      paymentSucceeded = true;
      onPaid(await confirmAdPayment(paymentIntentId));
    } catch (err) {
      if (!paymentSucceeded) onWalletFailure?.();
      onError(err instanceof Error ? err.message : getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-4">
      <ExpressCheckoutElement
        options={{
          paymentMethods: { applePay: 'auto', googlePay: 'auto', link: 'never', paypal: 'never', klarna: 'never', amazonPay: 'never' },
          buttonType: { applePay: 'plain', googlePay: 'plain' },
          buttonHeight: 48,
          layout: { maxColumns: 1, maxRows: 2, overflow: 'never' },
        }}
        onConfirm={(event) => submitPayment(() => event.paymentFailed({ reason: 'fail' }))}
        onReady={(event) => setWalletAvailable(Boolean(event.availablePaymentMethods?.applePay || event.availablePaymentMethods?.googlePay))}
        onLoadError={() => onError('No se pudieron cargar Apple Pay o Google Pay.')}
      />
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-400" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200" />
        <span>o paga con tarjeta</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <PaymentElement options={{ layout: 'tabs', wallets: { applePay: 'never', googlePay: 'never', link: 'never' } }} />
      <Button onClick={() => submitPayment()} loading={paying} disabled={!stripe || !elements} className="w-full">
        {paying ? 'Procesando pago...' : 'Pagar con tarjeta'}
      </Button>
      {!walletAvailable && <p className="text-sm text-gray-600">Apple Pay o Google Pay aparecen solo en dispositivos compatibles.</p>}
      {paying && <p className="text-sm text-gray-600" role="status">Procesando pago seguro…</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onCancel} disabled={paying}>Volver</Button>
      </div>
    </div>
  );
}
