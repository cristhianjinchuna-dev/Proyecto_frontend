import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import type { ReservationContact } from '../../types/reservation';
import {
  buildContactMessage,
  buildMailtoLink,
  buildPhoneLink,
  buildWhatsAppLink,
  formatPhone,
} from '../../utils/contact';

interface ReservationContactCardProps {
  contact: ReservationContact;
  contactRole: 'arrendador' | 'estudiante';
  reservationId: number;
  roomAddress?: string;
}

const LINK_BASE =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition';

// Shown only when the reservation is CONFIRMADO: both parties can now talk to each other
export function ReservationContactCard({ contact, contactRole, reservationId, roomAddress }: ReservationContactCardProps) {
  const message = buildContactMessage(contact.nombre, reservationId, roomAddress);
  const subject = `MuvU - Reserva #${reservationId}`;

  return (
    <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-green-200">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Contacto del {contactRole}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          La reserva está confirmada. Coordina la entrega de llaves y el pago directamente.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Avatar name={contact.nombre} src={contact.fotoPerfil} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{contact.nombre}</p>
          <p className="truncate text-sm text-gray-600">{contact.correo}</p>
          <p className="text-sm text-gray-600">
            {contact.telefono ? formatPhone(contact.telefono) : 'Sin celular registrado'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {contact.telefono && (
          <a
            href={buildWhatsAppLink(contact.telefono, message)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${LINK_BASE} bg-green-600 text-white hover:bg-green-700`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </a>
        )}
        <a
          href={buildMailtoLink(contact.correo, subject, message)}
          className={`${LINK_BASE} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        >
          <Mail className="h-4 w-4" aria-hidden /> Correo
        </a>
        {contact.telefono && (
          <a
            href={buildPhoneLink(contact.telefono)}
            className={`${LINK_BASE} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
          >
            <Phone className="h-4 w-4" aria-hidden /> Llamar
          </a>
        )}
      </div>
    </article>
  );
}
