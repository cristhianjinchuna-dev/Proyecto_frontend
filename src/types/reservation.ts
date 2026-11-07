export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';

// ReservaResponseDTO (OJO: the backend uses snake_case for the dates)
export interface Reservation {
  id: number;
  estado: ReservationStatus;
  fecha_inicio: string; // yyyy-MM-dd
  fecha_fin: string; // yyyy-MM-dd
  habitacionId: number;
  estudianteId: number;
}

// EP 021 body
export interface CreateReservationRequest {
  fecha_inicio: string;
  fecha_fin: string;
  habitacionId: number;
}