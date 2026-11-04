export type Role = 'ESTUDIANTE' | 'ARRENDADOR' | 'ADMIN';
export type RegisterRole = Exclude<Role, 'ADMIN'>;

// Response of EP 002 / EP 003 / EP 004
export interface AuthResponse {
  token: string;
  refreshToken: string;
  rol: Role;
  id: number;
}

// Request bodies (field names must match the backend DTOs)
export interface RegisterStudentRequest {
  nombre: string;
  correo: string;
  contrasena: string;
  universidadId: number;
}

export interface RegisterLandlordRequest {
  nombre: string;
  correo: string;
  contrasena: string;
}

// What the frontend keeps about the logged-in user
export interface AuthUser {
  id: number;
  role: Role;
}