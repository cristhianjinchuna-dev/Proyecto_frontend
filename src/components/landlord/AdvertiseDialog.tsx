import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';
import { createAdPayment } from '../../api/payments';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { AD_PLANS, PAYMENT_METHOD_LABELS, type AdPayment, type PaymentMethod } from '../../types/payment';
import type { Room } from '../../types/room';
import { formatPrice } from '../../utils/format';

interface AdvertiseDialogProps {
  room: Room | null; // null = dialog closed
  onClose: () => void;
  onPaid: (payment: AdPayment) => void;
}

// The content is a separate component, so every time the dialog opens it starts with fresh state
export function AdvertiseDialog({ room, onClose, onPaid }: AdvertiseDialogProps) {
  if (!room) return null;
  return <AdvertiseDialogContent room={room} onClose={onClose} onPaid={onPaid} />;
}

interface AdvertiseDialogContentProps {
  room: Room;
  onClose: () => void;
  onPaid: (payment: AdPayment) => void;
}

// EP 034 - the landlord picks a plan and a payment method. No card data is asked (Stripe test mode).
function AdvertiseDialogContent({ room, onClose, onPaid }: AdvertiseDialogContentProps) {
  const [amount, setAmount] = useState(AD_PLANS[0].amount);
  const [method, setMethod] = useState<PaymentMethod>('TARJETA_DEBITO');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close with Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !paying) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paying, onClose]);

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const payment = await createAdPayment({ habitacionId: room.id, monto: amount, metodoPago: method });
      onPaid(payment);
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. 502 when Stripe rejects the payment
    } finally {
      setPaying(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !paying && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="advertise-title"
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="advertise-title" className="text-lg font-semibold text-gray-900">
              Destacar habitación
            </h2>
            <p className="mt-1 text-sm text-gray-600">{room.direccion}</p>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">Plan</legend>
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

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">Método de pago</legend>
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
              <input
                type="radio"
                name="method"
                checked={method === option}
                onChange={() => setMethod(option)}
              />
              {PAYMENT_METHOD_LABELS[option]}
            </label>
          ))}
        </fieldset>

        <p className="text-xs text-gray-500">
          Pago de prueba: no se piden datos de tarjeta. Tu habitación aparecerá primero en las búsquedas
          {room.esDestacada && ' (ya está destacada; el nuevo pago se suma al historial)'}.
        </p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={paying}>
            Cancelar
          </Button>
          <Button onClick={handlePay} loading={paying}>
            {paying ? 'Pagando...' : `Pagar ${formatPrice(amount)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
