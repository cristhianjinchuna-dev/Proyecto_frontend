import type { Role } from '../types/auth';

export const PATHS = {
  home: '/',
  register: '/register',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password', // must match the link sent by the backend email
  roomDetail: '/rooms/:id',
  nearbyRooms: '/rooms/nearby',
  landlordDashboard: '/landlord',
  landlordProfile: '/landlord/profile',
  createRoom: '/landlord/rooms/new',
  editRoom: '/landlord/rooms/:id/edit',
  roomImages: '/landlord/rooms/:id/images',
} as const;

export function buildRoomPath(id: number): string {
  return `/rooms/${id}`;
}

export function buildEditRoomPath(id: number): string {
  return `/landlord/rooms/${id}/edit`;
}

export function buildRoomImagesPath(id: number): string {
  return `/landlord/rooms/${id}/images`;
}

// Where each role goes after logging in
export function getDefaultPathForRole(role: Role): string {
  switch (role) {
    case 'ARRENDADOR':
      return PATHS.landlordDashboard;
    case 'ADMIN':
    case 'ESTUDIANTE':
    default:
      return PATHS.home;
  }
}