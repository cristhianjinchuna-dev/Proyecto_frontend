// CalificacionResponseDTO (EP 011, 027, 028, 029)
export interface Rating {
  id: number;
  puntuacion: number;
  descripcion: string | null;
  autorId: number;
  autorNombre: string;
  autorFotoPerfil: string | null;
  habitacionId: number;
  reservaId: number;
}

// EP 027 body
export interface CreateRatingRequest {
  puntuacion: number; // 1 to 5
  descripcion: string | null; // optional, max 255
  reservaId: number;
}