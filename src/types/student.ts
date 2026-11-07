// EP 025 - EstudiantePerfilDTO (what a landlord sees before confirming)
export interface StudentProfile {
  id: number;
  nombre: string;
  verificado: boolean;
  universidadId: number;
  universidadNombre: string;
  puntuacionPromedio: number | null; // average of the ratings the student HAS GIVEN
  totalCalificaciones: number;
}