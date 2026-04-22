import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateServer } from '../hooks/useCreateServer';
import { useServerStore } from '../store/serverStore';
import { TEMP_USER_ID } from '../../../config/constants';
import { mapToServerCreateRequest } from '../types/server.types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type FormValues = {
  name: string;
};

interface CreateServerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateServerForm: React.FC<CreateServerFormProps> = ({ onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<FormValues>({
    mode: 'onChange',
  });
  
  const { createServer, isLoading, error: apiError } = useCreateServer();
  const addServer = useServerStore(state => state.addServer);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    const trimmedName = data.name.trim();
    if (!trimmedName) return;

    const payload = mapToServerCreateRequest(trimmedName, TEMP_USER_ID);

    const newServer = await createServer(payload);
    if (newServer) {
      addServer(newServer);
      reset();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center">
      <div className="text-center mb-8 text-sm text-slate-500 px-4 leading-relaxed tracking-wide font-medium">
        Establish a new environment for your team's collaboration.
      </div>
      
      <div className="relative group cursor-pointer mb-8">
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] border-[4px] border-white overflow-hidden">
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300" />
          <span className="text-white font-bold text-sm tracking-widest uppercase z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md">Upload</span>
        </div>
        <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full border-[3px] border-white shadow-md transition-transform duration-300 group-hover:scale-125" />
      </div>

      <div className="w-full text-left mb-8">
        <label className="block mb-2 text-[12px] font-bold text-slate-500 tracking-widest uppercase">
          Workspace Name <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          type="text"
          {...register("name", {
            required: "Name is required",
            maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
            validate: value => value.trim().length > 0 || "Name cannot be empty"
          })}
          className={cn(
            "w-full bg-slate-50 text-slate-900 placeholder-slate-400 font-bold rounded-xl px-5 py-4 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-2",
            errors.name 
              ? "border-red-500/50 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20" 
              : "border-slate-200 hover:border-blue-400/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white"
          )}
          placeholder="e.g. Engineering Team"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-3 font-semibold tracking-wide">
            {errors.name.message}
          </p>
        )}
        {apiError && (
          <p className="text-red-500 text-sm mt-3 p-4 bg-red-50 rounded-xl border border-red-200 font-semibold tracking-wide shadow-sm">
            {apiError}
          </p>
        )}
      </div>

      <div className="w-full flex justify-between items-center bg-slate-50/80 -mx-8 px-8 py-5 mt-2 border-t border-slate-200/80 backdrop-blur-sm" style={{ width: 'calc(100% + 64px)' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="text-slate-500 hover:text-slate-900 text-sm font-bold px-4 py-2 transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:-translate-y-1 text-white text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center min-w-[160px]"
        >
          {isLoading ? "Loading..." : "Create Workspace"}
        </button>
      </div>
    </form>
  );
};
