import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { PageLoader } from '../ui/PageLoader';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        {/* key: resets the boundary when the user navigates to another page */}
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}