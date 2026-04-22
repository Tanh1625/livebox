import React, { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "h-14 font-bold rounded-full text-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed shadow-[0_10px_25px_rgba(0,227,253,0.3)]",
    secondary: "bg-surface-container-highest text-primary",
    danger: "bg-error-container/10 text-error hover:bg-error-container/20"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
