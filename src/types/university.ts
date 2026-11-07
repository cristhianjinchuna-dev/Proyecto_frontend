export interface University {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
}

// EP 038 - body (UniversidadRequestDTO). The backend finds the coordinates.
export interface CreateUniversityRequest {
  nombre: string;
  direccion: string;
}
