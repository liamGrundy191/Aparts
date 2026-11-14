import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate } from 'react-router-dom';
import { registerSchema, type RegisterInput } from '@aparts/shared';
import { useAuth } from '../auth/AuthContext';
import { AuthCard } from '@/components/AuthCard';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const emptyValues: RegisterInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export default function RegisterPage() {
  const { user, isLoading: authLoading, register: registerReq, error, clearError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: emptyValues,
  });

  // Don't show an error left over from the login page.
  useEffect(() => clearError(), [clearError]);

  if (authLoading) return null;
  if (user) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

  // The button is disabled while isSubmitting, so double submits can't happen.
  const onSubmit = (values: RegisterInput) => registerReq(values);

  return (
    <AuthCard subtitle="Create your account">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField id="firstName" label="First name" error={errors.firstName?.message}>
            <Input
              id="firstName"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              autoFocus
              {...register('firstName')}
            />
          </FormField>
          <FormField id="lastName" label="Last name" error={errors.lastName?.message}>
            <Input
              id="lastName"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          id="phone"
          label="Phone"
          hint="Your manager uses it with your email to find you"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          hint="At least 8 characters"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gray-900 underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
