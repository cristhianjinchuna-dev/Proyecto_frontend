import type { PageParams } from './page';

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
  oculta?: boolean; // hidden by the ADMIN (only the owner sees it in his panel)
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
  latitud: number;
  longitud: number;
  precio: number;
  area: number | null;
  descripcion: string | null; // optional text from the landlord
  oculta?: boolean; // hidden by the ADMIN
  disponible?: boolean; // false = hidden or its landlord is suspended: can't be booked
  imagenes: RoomImage[];
}

// EP 008 - sort options accepted by GET /habitaciones?orden=
export type RoomSort = 'recomendadas' | 'precio_asc' | 'precio_desc' | 'area_desc';

// EP 008 - query params (search, price range and sort are optional)
export interface RoomSearchParams extends PageParams {
  q?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: RoomSort;
}

// EP 012 - query params
export interface NearbyRoomsParams extends PageParams {
  universidadId: number;
  radioKm: number;
}

// EP 016 / EP 019 - body (HabitacionRequestDTO)
export interface RoomRequest {
  direccion: string;
  precio: number;
  area: number;
  latitud?: number;
  longitud?: number;
  descripcion?: string; // '' = no description
}

// EP 017 - body (ImagenRequestDTO)
export interface CreateImageRequest {
  url: string;
}