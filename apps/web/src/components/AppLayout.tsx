import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <span className="text-lg font-semibold">Aparts</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {user?.firstName} {user?.lastName} · {user?.role}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-md px-2 py-1 font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
