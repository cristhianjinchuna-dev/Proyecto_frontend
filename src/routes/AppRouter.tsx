import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PATHS } from './paths';

const HomePage = lazy(() => import('../pages/HomePage'));
const RoomDetailPage = lazy(() => import('../pages/RoomDetailPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.roomDetail} element={<RoomDetailPage />} />
        <Route path={PATHS.register} element={<RegisterPage />} />
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}