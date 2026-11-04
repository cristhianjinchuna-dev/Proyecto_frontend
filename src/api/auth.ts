import { api } from './client';
import type { AuthResponse, RegisterLandlordRequest, RegisterStudentRequest } from '../types/auth';

// EP 002 - POST /auth/register/estudiante (public)
export async function registerStudent(body: RegisterStudentRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register/estudiante', body);
  return data;
}

// EP 003 - POST /auth/register/arrendador (public)
export async function registerLandlord(body: RegisterLandlordRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register/arrendador', body);
  return data;
}