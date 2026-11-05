import { api } from './client';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterLandlordRequest,
  RegisterStudentRequest,
  ResetPasswordRequest,
} from '../types/auth';

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

// EP 004 - POST /auth/login (public)
export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', body);
  return data;
}

// EP 006 - POST /auth/forgot-password (public, always 204)
export async function forgotPassword(body: ForgotPasswordRequest): Promise<void> {
  await api.post('/auth/forgot-password', body);
}

// EP 007 - POST /auth/reset-password (public, 204)
export async function resetPassword(body: ResetPasswordRequest): Promise<void> {
  await api.post('/auth/reset-password', body);
}

// EP 005 (refresh) lives in client.ts because the interceptor needs it