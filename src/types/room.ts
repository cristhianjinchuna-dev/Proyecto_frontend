// EP 008 / EP 012 - list item (HabitacionResponseDTO)
export interface Room {
  id: number;
  direccion: string;
  precio: number;
  latitud: number;
  longitud: number;
  esDestacada: boolean;
  distanciaKm: number | null; // null in EP 008, filled in EP 012
  area: number | null;
}

// EP 010 - ImagenResponseDTO
export interface RoomImage {
  id: number;
  url: string;
  habitacionId: number;
}

// EP 009 - HabitacionDetailDTO
export interface RoomDetail {
  id: number;
  direccion: string;
  precio: number;
  area: number | null;
  imagenes: RoomImage[];
}