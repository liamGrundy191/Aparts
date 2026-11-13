import type { Role } from '@aparts/shared';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-label="Loading"
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleRoute({ role }: { role: Role }) {
  const { user } = useAuth();
  // Wrong role: go to your own home, not the login page
  if (user && user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  return <Outlet />;
}
