import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { RegisterRequest } from '../types';

export const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const setToken = useAuthStore(state => state.setToken);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const response = await authApi.register(data);

      if (response && response.accessToken) {
        setToken(response.accessToken);
        navigate('/servers/empty');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      setServerError(error.response?.data?.message || 'Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface-container-low/60 backdrop-blur-[40px] rounded-lg p-10 flex flex-col gap-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
      {/* Brand Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center rotate-3">
            <span className="material-symbols-outlined text-on-primary-fixed font-bold">bolt</span>
          </div>
          <span className="text-2xl font-black text-primary italic tracking-tighter font-headline">LiveBox</span>
        </div>
        <h1 className="text-4xl font-bold font-display tracking-tight text-on-surface">Create an Account</h1>
        <p className="text-on-surface-variant font-body">Join the next generation of communication.</p>
      </div>

      {serverError && (
        <div className="p-4 rounded-md bg-error-container/20 border border-error/50">
          <p className="text-error text-sm font-body text-center">{serverError}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-4">
          <Input
            placeholder="Username"
            type="text"
            icon="person"
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              },
              maxLength: {
                value: 30,
                message: 'Username must be at most 30 characters'
              }
            })}
            error={errors.username?.message}
          />

          <Input
            placeholder="Email"
            type="email"
            icon="mail"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            error={errors.email?.message}
          />

          <Input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            icon="lock"
            actionIcon={showPassword ? "visibility_off" : "visibility"}
            onActionClick={() => setShowPassword(!showPassword)}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={errors.password?.message}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Register
          </Button>
        </div>
      </form>

      {/* Bottom Separator */}
      <div className="h-px w-full bg-surface-container-highest"></div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-on-surface-variant text-sm font-body">
          Already have an account?
          <Link to="/login" className="text-secondary font-semibold hover:underline ml-1">Login</Link>
        </p>
      </div>
    </div>
  );
};
