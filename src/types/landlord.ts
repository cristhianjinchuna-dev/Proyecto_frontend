// EP 014 / EP 015 - ArrendadorResponseDTO
export interface Landlord {
  id: number;
  nombre: string;
  correo: string;
  verificado: boolean;
  puntajePromedio: number | null;
  totalCalificaciones: number;
  cantidadHabitaciones: number;
  fotoPerfil: string | null;
}

// GET /arrendadores (ADMIN only) - ArrendadorAdminDTO: also has the DNI photo to verify the landlord
export interface LandlordAdmin extends Landlord {
  dniFoto: string | null;
}

// EP 015 - body (ArrendadorUpdateRequestDTO). null = keep the current photo
export interface UpdateLandlordRequest {
  nombre: string;
  dniFoto: string | null;
  fotoPerfil?: string | null;
}
