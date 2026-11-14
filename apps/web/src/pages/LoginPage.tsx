import { useEffect, useState, type SubmitEvent } from 'react';
import { loginSchema } from '@aparts/shared';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/ui/button';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900';

// Neutral until touched; green when valid; red only after the user leaves the field.
function fieldClass(value: string, valid: boolean, touched: boolean) {
  if (valid) return `${inputClass} border-green-500 focus:border-green-600 focus:ring-green-600`;
  if (touched && value)
    return `${inputClass} border-red-400 focus:border-red-500 focus:ring-red-500`;
  return inputClass;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { error, clearError, login, user, isLoading: authLoading } = useAuth();
  const emailValid = loginSchema.shape.email.safeParse(email).success;
  const passwordValid = loginSchema.shape.password.safeParse(password).success;
  const showEmailError = touched.email && !!email && !emailValid;
  const showPasswordError = touched.password && !!password && !passwordValid;

  // Don't show an error left over from the register page.
  useEffect(() => clearError(), [clearError]);

  if (authLoading) return null;
  if (user) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <AuthCard subtitle="Welcome back">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={showEmailError}
            className={fieldClass(email, emailValid, touched.email)}
          />
          {showEmailError && (
            <span className="text-xs text-red-600">Enter a valid email address</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            aria-invalid={showPasswordError}
            className={fieldClass(password, passwordValid, touched.password)}
          />
          {showPasswordError && <span className="text-xs text-red-600">At least 8 characters</span>}
        </label>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!email || !password || showPasswordError || showEmailError}
          className="mt-2"
        >
          Log in
        </Button>
        {error && <p className="text-red-600">{error}</p>}
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{' '}
        <Link to="/register" className="font-medium text-gray-900 underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
