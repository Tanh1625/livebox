import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { serverApi } from '../api/serverApi';
import { ServerCreateRequest } from '../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from '@/store/useToastStore';
import { X, Camera } from 'lucide-react';

export const CreateServerScreen: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ServerCreateRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const onSubmit = async (data: ServerCreateRequest) => {
    try {
      setIsLoading(true);

      const requestData: ServerCreateRequest = { ...data };
      if (avatarFile) {
        requestData.avatar = avatarFile;
      }

      const response = await serverApi.createServer(requestData);

      if (response && response.id) {
        toast.success(`Server "${response.name}" created successfully!`);
        navigate('/app/main');
      }
    } catch (error: any) {
      console.error('Create server failed:', error);
      const message = error.response?.data?.message || 'Failed to create server. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

      {/* Modal Card */}
      <div className="relative w-full max-w-[480px] bg-surface-container-low/80 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Decorative glow orbs inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-10 pt-10 pb-6 relative">
          <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight uppercase italic">
            Ignite a Server
          </h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-container-high/50 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-300 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-10 py-6 space-y-10 relative">

            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="avatar-upload"
                className="group relative w-32 h-32 flex flex-col items-center justify-center rounded-[2rem] bg-surface-container-highest/50 cursor-pointer transition-all hover:bg-surface-container-high border-2 border-dashed border-outline-variant/30 hover:border-primary overflow-hidden shadow-inner"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-outline/60 uppercase">
                      Upload Icon
                    </span>
                  </div>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="mt-4 text-[11px] text-outline/40 text-center px-8 leading-relaxed">
                Add an icon to give your server personality. Max 5MB.
              </p>
            </div>

            {/* Server Name Input */}
            <div className="space-y-4">
               <Input
                 label="Server Name"
                 placeholder="Enter your server's name"
                 icon="dns"
                 {...register('name', {
                   required: 'Server Name is required',
                   minLength: { value: 3, message: 'Name must be at least 3 characters' },
                   maxLength: { value: 50, message: 'Name must be at most 50 characters' },
                 })}
                 error={errors.name?.message}
               />
              
              <p className="text-[10px] text-outline/40 ml-1 leading-relaxed">
                By creating a server, you agree to the{' '}
                <span className="text-secondary hover:underline cursor-pointer">Community Guidelines</span>.
              </p>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-10 pb-12 pt-6 flex items-center justify-between gap-6 relative">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-outline/60 hover:text-on-surface transition-colors duration-200"
            >
              Back
            </button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1"
              size="lg"
            >
              Create Server
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
