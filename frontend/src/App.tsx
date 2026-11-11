import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PermissionsProvider, usePermissions } from './context/PermissionsContext';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import { lazy } from 'react';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Button } from './components/ui/Button';
import { firstAllowedRoute } from './utils/landingRoute';
import { importWithReload } from './utils/lazyReload';

// Cada pantalla se descarga al abrirla: antes todo venia en un archivo de 2,9 MB.
const Dashboard = lazy(() => importWithReload(() => import('./pages/Dashboard')));
const StatsView = lazy(() => importWithReload(() => import('./pages/StatsView')));
const Sales = lazy(() => importWithReload(() => import('./pages/Sales')));
const Clients = lazy(() => importWithReload(() => import('./pages/Clients')));
const Responsables = lazy(() => importWithReload(() => import('./pages/Responsables')));
const Itineraries = lazy(() => importWithReload(() => import('./pages/Itineraries')));
const Users = lazy(() => importWithReload(() => import('./pages/Users')));
const Config = lazy(() => importWithReload(() => import('./pages/Config')));
const CommissionAgents = lazy(() => importWithReload(() => import('./pages/CommissionAgents')));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <PermissionsProvider user={user}>{children}</PermissionsProvider>;
}

function NoScreensAssigned() {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-[60vh] text-center text-gray-500 dark:text-slate-400">
      <p className="text-lg font-medium">Tu usuario no tiene pantallas asignadas</p>
      <p className="text-sm">Habla con el administrador.</p>
      <Button variant="outline" onClick={logout}>Cerrar sesión</Button>
    </div>
  );
}

// El menu oculta lo que un rol no puede ver, pero escribiendo la URL se abria igual: un
// freelancer veia los catalogos de /config (hallazgo 11 de la auditoria del frontend).
function RequireView({ module, children }: { module: string; children: React.ReactNode }) {
  const { puede } = usePermissions();
  if (puede(module, 'view')) return <>{children}</>;
  const route = firstAllowedRoute((m) => puede(m, 'view'));
  return route ? <Navigate to={route} replace /> : <NoScreensAssigned />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RequireView module="dashboard"><Dashboard /></RequireView>} />
        <Route path="stats" element={<RequireView module="dashboard"><StatsView /></RequireView>} />
        <Route path="sales" element={<RequireView module="sales"><Sales /></RequireView>} />
        <Route path="clients" element={<RequireView module="clients"><Clients /></RequireView>} />
        <Route path="responsables" element={<RequireView module="responsables"><Responsables /></RequireView>} />
        <Route path="itineraries" element={<RequireView module="itineraries"><Itineraries /></RequireView>} />
        <Route path="users" element={<RequireView module="users"><Users /></RequireView>} />
        <Route path="config" element={<RequireView module="config"><Config /></RequireView>} />
        <Route path="commissions" element={<RequireView module="commissions"><CommissionAgents /></RequireView>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}