import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, UserRound } from 'lucide-react';
import { getRoomById } from '../../api/rooms';
import { getStudentProfile } from '../../api/students';
import { useFetch } from '../../hooks/useFetch';
import { buildReservationPath, buildRoomPath } from '../../routes/paths';
import type { Reservation } from '../../types/reservation';
import { countNights, formatDate } from '../../utils/dates';
import { ReservationStatusBadge } from './ReservationStatusBadge';

interface ReservationCardProps {
  reservation: Reservation;
  showStudent?: boolean; // landlord view: who made the request (EP 025)
  actions?: ReactNode;
}

// The reservation only has habitacionId, so we load the address (EP 009)
function RoomAddress({ roomId }: { roomId: number }) {
  const { data: room, loading } = useFetch((signal) => getRoomById(roomId, signal), [roomId]);
  if (loading) return <span className="inline-block h-4 w-48 animate-pulse rounded bg-gray-200" />;
  return (
    <Link to={buildRoomPath(roomId)} className="truncate hover:text-blue-600 hover:underline">
      {room?.direccion ?? `Habitación #${roomId}`}
    </Link>
  );
}

function StudentName({ studentId }: { studentId: number }) {
  const { data: student, loading } = useFetch((signal) => getStudentProfile(studentId, signal), [studentId]);
  if (loading) return <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-200" />;
  return <span>{student ? `${student.nombre} · ${student.universidadNombre}` : `Estudiante #${studentId}`}</span>;
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
          <RoomAddress roomId={reservation.habitacionId} />
        </p>

        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          {formatDate(reservation.fecha_inicio)} → {formatDate(reservation.fecha_fin)}
          <span className="text-gray-400">· {nights} {nights === 1 ? 'noche' : 'noches'}</span>
        </p>

        {showStudent && (
          <p className="flex items-center gap-1.5 text-sm text-gray-600">
            <UserRound className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <StudentName studentId={reservation.estudianteId} />
          </p>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </li>
  );
}