// EP 031 / EP 032 response - EstudianteResponseDTO
export interface Student {
  id: number;
  nombre: string;
  correo: string;
  verificado: boolean;
  universidadNombre: string;
  fotoPerfil: string | null;
  telefono?: string | null; // only comes back for the student himself (or ADMIN)
}

// EP 032 body - EstudianteUpdateRequestDTO (email and password can't change here)
export interface UpdateStudentRequest {
  nombre: string;
  universidadId: number;
  fotoPerfil?: string | null; // new profile photo URL; null/omitted = keep the current one
  telefono?: string; // '' = remove it; omitted = keep the current one
}

// EP 025 - EstudiantePerfilDTO (what a landlord sees before confirming)
export interface StudentProfile {
  id: number;
  nombre: string;
  verificado: boolean;
  universidadId: number;
  universidadNombre: string;
  puntuacionPromedio: number | null; // average of the ratings the student HAS GIVEN
  totalCalificaciones: number;
  fotoPerfil: string | null;
}