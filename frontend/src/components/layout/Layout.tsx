import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChunkErrorBoundary } from '../ui/ChunkErrorBoundary';
import { PageSkeleton } from '../ui/PageSkeleton';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useData } from '../../context/DataContext';

export function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { loadError } = useData();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[90] md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <div className="pl-0 md:pl-20 transition-all duration-300">
        <Header onMenuToggle={() => setIsMobileOpen(true)} />
        <main className="p-4 md:p-6 overflow-x-hidden">
          {loadError && (
            <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {loadError}
            </div>
          )}
          {/* La clave reinicia el error al cambiar de pantalla. */}
          <ChunkErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ChunkErrorBoundary>
        </main>
      </div>
    </div>
  );
}