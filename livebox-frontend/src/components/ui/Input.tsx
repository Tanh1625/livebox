import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string; // Material symbol icon name for the left side
  actionIcon?: string; // Material symbol icon name for the right side
  onActionClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, actionIcon, onActionClick, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              "w-full h-14 bg-surface-container-high rounded-lg text-on-surface placeholder:text-outline border-none focus:ring-0 focus:bg-surface-bright transition-all duration-300",
              icon ? "pl-14" : "pl-6",
              actionIcon ? "pr-12" : "pr-6",
              className
            )}
            {...props}
          />
          
          {actionIcon && (
            <div className="absolute inset-y-0 right-4 flex items-center">
              <button 
                type="button"
                onClick={onActionClick}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">{actionIcon}</span>
              </button>
            </div>
          )}
          
          <div className={cn(
            "absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300",
            error 
              ? "opacity-100 ring-1 ring-error shadow-[0_0_15px_rgba(255,113,108,0.2)]" 
              : "opacity-0 group-focus-within:opacity-100 shadow-[0_0_15px_rgba(129,236,255,0.2)] ring-1 ring-primary/20"
          )}></div>
        </div>
        {error && <p className="text-error text-xs font-label mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
