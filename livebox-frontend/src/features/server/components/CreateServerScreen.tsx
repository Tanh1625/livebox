import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { serverApi } from '../api/serverApi';
import { ServerCreateRequest } from '../types';

export const CreateServerScreen: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ServerCreateRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const onSubmit = async (data: ServerCreateRequest) => {
    try {
      setIsLoading(true);
      setServerError(null);
      
      const response = await serverApi.createServer(data);
      
      if (response && response.id) {
        // Navigate to the server channel page (or somewhere appropriate)
        // For now, let's navigate to the main layout or the new server
        navigate(`/servers/${response.id}`); 
      }
    } catch (error: any) {
      console.error('Create server failed:', error);
      setServerError(error.response?.data?.message || 'Failed to create server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient Cinematic Background Effects */}
      <div className="absolute inset-0 pointer-events-none bg-electric-glow z-0"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full z-0"></div>
      <div className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] bg-secondary/15 blur-[160px] rounded-full z-0"></div>
      
      <main className="flex-grow flex items-center justify-center p-6 z-10 relative">
        <div className="w-full max-w-md bg-surface-container-low/60 backdrop-blur-[40px] rounded-[2rem] p-10 flex flex-col gap-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-outline-variant/20">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(129,236,255,0.4)]">
                <span className="material-symbols-outlined text-surface-container-lowest text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  rocket_launch
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-on-surface">Create a Server</h1>
            <p className="text-on-surface-variant font-body">Your new community starts here.</p>
          </div>

          {serverError && (
            <div className="p-4 rounded-md bg-error-container/20 border border-error/50">
              <p className="text-error text-sm font-body text-center">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-4">
              <Input
                placeholder="Server Name"
                type="text"
                icon="grid_view"
                {...register('name', { 
                  required: 'Server Name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name must be at most 50 characters'
                  }
                })}
                error={errors.name?.message}
              />

              <Input
                placeholder="Avatar URL (Optional)"
                type="url"
                icon="image"
                {...register('avatarUrl')}
                error={errors.avatarUrl?.message}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-2">
              <Button type="submit" isLoading={isLoading} className="w-full neon-glow-primary">
                Create
              </Button>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="w-full py-3 text-on-surface-variant hover:text-on-surface font-semibold tracking-wide transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
