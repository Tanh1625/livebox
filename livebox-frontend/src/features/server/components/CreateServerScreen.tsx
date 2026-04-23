import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { serverApi } from '../api/serverApi';
import { ServerCreateRequest } from '../types';

export const CreateServerScreen: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ServerCreateRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const navigate = useNavigate();

  const onSubmit = async (data: ServerCreateRequest) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const response = await serverApi.createServer(data);

      if (response && response.id) {
        navigate('/app/main');
      }
    } catch (error: any) {
      console.error('Create server failed:', error);
      setServerError(error.response?.data?.message || 'Failed to create server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    /* Full-screen overlay */
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">

      {/* Background ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-[480px] bg-surface-container-low/60 backdrop-blur-2xl rounded-lg overflow-hidden"
        style={{ boxShadow: '0 16px 64px rgba(129,236,255,0.08), 0 32px 128px rgba(166,140,255,0.05)' }}
      >
        {/* Decorative glow orbs inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 relative">
          <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
            Create a Server
          </h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-2 scale-95 active:scale-90 duration-200"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-6 space-y-10 relative">

            {/* Server Error */}
            {serverError && (
              <div className="p-3 rounded-md bg-error-container/20 border border-error/50">
                <p className="text-error text-sm font-body text-center">{serverError}</p>
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="avatar-upload"
                className="group relative w-24 h-24 flex flex-col items-center justify-center rounded-full bg-surface-container-highest cursor-pointer transition-all hover:bg-surface-bright border-2 border-dashed border-outline-variant hover:border-primary overflow-hidden"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-primary mb-1 text-3xl"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      add_a_photo
                    </span>
                    <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                      UPLOAD
                    </span>
                  </>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="mt-4 text-xs font-label text-on-surface-variant text-center px-8">
                Add an icon to give your server personality. Max 5MB.
              </p>
            </div>

            {/* Server Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="server-name"
                className="block font-label text-xs font-bold tracking-[0.15em] text-on-surface-variant uppercase ml-1"
              >
                SERVER NAME
              </label>
              <div className="relative group">
                <input
                  id="server-name"
                  type="text"
                  placeholder="Enter your server's name"
                  className="w-full h-14 bg-surface-container-high border-none rounded-md px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 focus:bg-surface-bright transition-all duration-300 outline-none"
                  {...register('name', {
                    required: 'Server Name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' },
                    maxLength: { value: 50, message: 'Name must be at most 50 characters' },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-error text-xs font-label ml-1">{errors.name.message}</p>
              )}
              <p className="text-[11px] text-outline ml-1">
                By creating a server, you agree to the{' '}
                <span className="text-secondary cursor-pointer hover:underline">
                  Community Guidelines
                </span>
                .
              </p>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-8 pb-10 pt-4 flex items-center justify-between gap-4 relative">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 font-label text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200 active:scale-95"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-headline font-bold py-3.5 px-8 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 tracking-wide disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 20px rgba(129,236,255,0.4)' }}
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Create Server
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
