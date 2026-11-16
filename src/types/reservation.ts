export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';

// ReservaResponseDTO (OJO: the backend uses snake_case for the dates)
export interface Reservation {
  id: number;
  estado: ReservationStatus;
  fecha_inicio: string; // yyyy-MM-dd
  fecha_fin: string; // yyyy-MM-dd
  habitacionId: number;
  estudianteId: number;
  // The other party (landlord for the student, student for the landlord). Only when CONFIRMADO
  contacto?: ReservationContact | null;
}

// ContactoDTO - shared once the landlord confirms the reservation
export interface ReservationContact {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null; // Peruvian mobile, 9 digits (optional)
  fotoPerfil: string | null;
}

// EP 021 body
export interface CreateReservationRequest {
  fecha_inicio: string;
  fecha_fin: string;
  habitacionId: number;
}