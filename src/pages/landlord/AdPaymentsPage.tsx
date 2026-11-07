import { Link } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import { getMyAdPayments } from '../../api/payments';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { useFetch } from '../../hooks/useFetch';
import { buildRoomPath, PATHS } from '../../routes/paths';
import { PAYMENT_METHOD_LABELS } from '../../types/payment';
import { formatDate, todayIso } from '../../utils/dates';
import { formatPrice } from '../../utils/format';

// EP 035 - payment history of the landlord
export default function AdPaymentsPage() {
  const { data, loading, error, reload } = useFetch((signal) => getMyAdPayments(signal), []);

  if (loading) return <PageLoader />;
  if (error || !data) {
    return (
      <section className="py-12">
        <ErrorState message={error ?? 'No se pudo cargar tu historial'} onRetry={reload} />
      </section>
    );
  }

  const today = todayIso();
  // Newest first (the backend does not sort them)
  const payments = [...data].sort((a, b) => b.id - a.id);

  return (
    <section className="space-y-6 py-8">
      <header className="space-y-2">
        <Link
          to={PATHS.landlordDashboard}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a mi panel
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Mis pagos de publicidad</h1>
      </header>

      {payments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-10 w-10" aria-hidden />}
          title="Aún no tienes pagos"
          description='Usa el botón "Destacar" en una de tus habitaciones para que aparezca primero.'
        />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Habitación</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium">Hasta</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3">
                    <Link to={buildRoomPath(payment.habitacionId)} className="text-blue-600 hover:underline">
                      Habitación #{payment.habitacionId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(payment.monto)}</td>
                  <td className="px-4 py-3 text-gray-700">{PAYMENT_METHOD_LABELS[payment.metodoPago]}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(payment.fechaInicio)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(payment.fechaFin)}</td>
                  <td className="px-4 py-3">
                    {payment.fechaFin >= today ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        Vencido
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
