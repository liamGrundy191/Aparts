import { Role } from '@aparts/shared';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './auth/guards';
import { AppLayout } from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/manager/DashboardPage';
import MyLeasePage from './pages/tenant/MyLeasePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute role={Role.MANAGER} />}>
            <Route path="/manager" element={<DashboardPage />} />
            {/* properties, units, tenants, leases, payments, maintenance */}
          </Route>

          <Route element={<RoleRoute role={Role.TENANT} />}>
            <Route path="/tenant" element={<MyLeasePage />} />
            {/* my payments, my requests */}
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
