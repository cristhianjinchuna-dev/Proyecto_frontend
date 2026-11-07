import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PATHS } from './paths';
import { PrivateRoute } from './PrivateRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const RoomDetailPage = lazy(() => import('../pages/RoomDetailPage'));
const NearbyRoomsPage = lazy(() => import('../pages/NearbyRoomsPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const LandlordDashboardPage = lazy(() => import('../pages/landlord/LandlordDashboardPage'));
const LandlordProfilePage = lazy(() => import('../pages/landlord/LandlordProfilePage'));
const CreateRoomPage = lazy(() => import('../pages/landlord/CreateRoomPage'));
const EditRoomPage = lazy(() => import('../pages/landlord/EditRoomPage'));
const RoomImagesPage = lazy(() => import('../pages/landlord/RoomImagesPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.nearbyRooms} element={<NearbyRoomsPage />} />
        <Route path={PATHS.roomDetail} element={<RoomDetailPage />} />
        <Route path={PATHS.register} element={<RegisterPage />} />
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />

        {/* Landlord only */}
        <Route element={<PrivateRoute allowedRoles={['ARRENDADOR']} />}>
          <Route path={PATHS.landlordDashboard} element={<LandlordDashboardPage />} />
          <Route path={PATHS.landlordProfile} element={<LandlordProfilePage />} />
          <Route path={PATHS.createRoom} element={<CreateRoomPage />} />
          <Route path={PATHS.editRoom} element={<EditRoomPage />} />
          <Route path={PATHS.roomImages} element={<RoomImagesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}