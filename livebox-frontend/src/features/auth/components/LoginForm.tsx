import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { LoginRequest } from '../types';
import { serverApi } from '../../server/api/serverApi';

export const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const setToken = useAuthStore(state => state.setToken);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const checkServersAndNavigate = async () => {
        try {
          const joinedServers = await serverApi.getMyServers();
          if (joinedServers.length > 0) {
            navigate('/app/main');
          } else {
            navigate('/servers/empty');
          }
        } catch (error) {
          console.warn('Auth check failed, redirecting to empty state', error);
          navigate('/servers/empty');
        }
      };
      checkServersAndNavigate();
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setServerError(null);
      
      const response = await authApi.login(data);
      
      if (response && response.accessToken) {
        setToken(response.accessToken);

        try {
          const joinedServers = await serverApi.getMyServers();
          if (joinedServers.length > 0) {
            navigate('/app/main');
            return;
          }
        } catch (serverCheckError) {
          console.warn('Could not check joined servers, fallback to empty state.', serverCheckError);
        }

        navigate('/servers/empty');
      }
    } catch (error : unknown) {
      console.error('Login failed:', error);
      setServerError((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to connect to the server. Please try again.');
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
        <h1 className="text-4xl font-bold font-display tracking-tight text-on-surface">Welcome back!</h1>
        <p className="text-on-surface-variant font-body">Ignite your session to continue.</p>
      </div>

      {serverError && (
        <div className="p-4 rounded-md bg-error-container/20 border border-error/50">
          <p className="text-error text-sm font-body text-center">{serverError}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-4">
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
            Login
          </Button>
          <div className="flex justify-center">
            <a className="text-sm font-medium text-secondary hover:text-secondary-fixed transition-colors tracking-wide" href="#">
              Forgot your password?
            </a>
          </div>
        </div>
      </form>

      {/* Bottom Separator */}
      <div className="h-px w-full bg-surface-container-highest"></div>
      
      {/* Registration Link */}
      <div className="text-center">
        <p className="text-on-surface-variant text-sm font-body">
          Need an account? 
          <Link to="/register" className="text-secondary font-semibold hover:underline ml-1">Register</Link>
        </p>
      </div>
    </div>
  );
};
