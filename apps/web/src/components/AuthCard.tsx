import type { ReactNode } from 'react';

/** The centred card with the logo, shared by the login and register pages */
export function AuthCard({ subtitle, children }: { subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="mb-6 flex flex-col items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden
          >
            <path d="M3 10.5 12 3l9 7.5V21H3z" strokeLinejoin="round" />
            <path d="M9 21v-6h6v6" strokeLinejoin="round" />
          </svg>
          <h1 className="text-xl font-semibold">Aparts</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
