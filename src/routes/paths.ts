import type { Role } from '../types/auth';

export const PATHS = {
  home: '/',
  register: '/register',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password', // must match the link sent by the backend email
  roomDetail: '/rooms/:id',
} as const;

export function buildRoomPath(id: number): string {
  return `/rooms/${id}`;
}

// Where each role goes after logging in (updated when we build each dashboard)
export function getDefaultPathForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
    case 'ARRENDADOR':
    case 'ESTUDIANTE':
    default:
      return PATHS.home;
  }
}