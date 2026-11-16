import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Mail, MapPin, MessageCircle } from 'lucide-react';
import { getStudentProfile } from '../../api/students';
import { useFetch } from '../../hooks/useFetch';
import { RoomAddressLink } from '../rooms/RoomAddressLink';
import { Avatar } from '../ui/Avatar';
import { buildReservationPath } from '../../routes/paths';
import type { Reservation } from '../../types/reservation';
import { buildContactMessage, buildMailtoLink, buildWhatsAppLink } from '../../utils/contact';
import { countNights, formatDate } from '../../utils/dates';
import { ReservationStatusBadge } from './ReservationStatusBadge';

interface ReservationCardProps {
  reservation: Reservation;
  showStudent?: boolean; // landlord view: who made the request (EP 025)
  actions?: ReactNode;
}

function StudentName({ studentId }: { studentId: number }) {
  const { data: student, loading } = useFetch((signal) => getStudentProfile(studentId, signal), [studentId]);
  if (loading) return <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-200" />;
  if (!student) return <span>{`Estudiante #${studentId}`}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Avatar name={student.nombre} src={student.fotoPerfil} size="xs" />
      {student.nombre} · {student.universidadNombre}
    </span>
  );
}

// Confirmed reservation: quick links to talk with the other party
function ContactLinks({ reservation }: { reservation: Reservation }) {
  const contact = reservation.contacto;
  if (!contact) return null;
  const message = buildContactMessage(contact.nombre, reservation.id);

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-gray-500">Contacto: {contact.nombre}</span>
      {contact.telefono && (
        <a
          href={buildWhatsAppLink(contact.telefono, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-green-700 hover:underline"
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
        </a>
      )}
      <a
        href={buildMailtoLink(contact.correo, `MuvU - Reserva #${reservation.id}`, message)}
        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
      >
        <Mail className="h-4 w-4" aria-hidden /> Correo
      </a>
    </p>
  );
}

export function ReservationCard({ reservation, showStudent = false, actions }: ReservationCardProps) {
  const nights = countNights(reservation.fecha_inicio, reservation.fecha_fin);

  return (
    <li className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={buildReservationPath(reservation.id)}
            className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
          >
            Reserva #{reservation.id}
          </Link>
          <ReservationStatusBadge status={reservation.estado} />
        </div>

        <p className="flex items-center gap-1.5 text-sm text-gray-700">
          <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <RoomAddressLink roomId={reservation.habitacionId} />
        </p>

        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          {formatDate(reservation.fecha_inicio)} → {formatDate(reservation.fecha_fin)}
          <span className="text-gray-400">· {nights} {nights === 1 ? 'noche' : 'noches'}</span>
        </p>

        {showStudent && (
          <p className="flex items-center gap-1.5 text-sm text-gray-600">
            <StudentName studentId={reservation.estudianteId} />
          </p>
        )}

        {reservation.estado === 'CONFIRMADO' && reservation.contacto && (
          <ContactLinks reservation={reservation} />
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </li>
  );
}