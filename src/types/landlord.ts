// EP 014 / EP 015 - ArrendadorResponseDTO
export interface Landlord {
  id: number;
  nombre: string;
  correo: string;
  verificado: boolean;
  puntajePromedio: number | null;
  totalCalificaciones: number;
  cantidadHabitaciones: number;
}

// EP 015 - body (ArrendadorUpdateRequestDTO)
export interface UpdateLandlordRequest {
  nombre: string;
  dniFoto: string | null;
}