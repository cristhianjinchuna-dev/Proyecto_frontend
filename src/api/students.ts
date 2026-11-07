import { api } from './client';
import type { Student, StudentProfile, UpdateStudentRequest } from '../types/student';

// EP 025 - GET /estudiantes/{id}/perfil (ARRENDADOR only)
export async function getStudentProfile(id: number, signal?: AbortSignal): Promise<StudentProfile> {
  const { data } = await api.get<StudentProfile>(`/estudiantes/${id}/perfil`, { signal });
  return data;
}

// EP 031 - GET /estudiantes/{id} (logged in)
export async function getStudent(id: number, signal?: AbortSignal): Promise<Student> {
  const { data } = await api.get<Student>(`/estudiantes/${id}`, { signal });
  return data;
}

// EP 032 - PUT /estudiantes/{id} (only the student himself)
export async function updateStudent(id: number, body: UpdateStudentRequest): Promise<Student> {
  const { data } = await api.put<Student>(`/estudiantes/${id}`, body);
  return data;
}

// EP 033 - DELETE /estudiantes/{id} (the student himself or ADMIN, 204)
export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/estudiantes/${id}`);
}