import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant" | "size" | "color" | "children"> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'none';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | 'none';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  rounded,
  isLoading, 
  disabled, 
  leftIcon,
  rightIcon,
  ...props 
}) => {
  const baseStyles = "relative font-bold transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed shadow-[0_10px_25px_rgba(0,227,253,0.3)] hover:neon-glow-primary",
    secondary: "bg-surface-container-highest text-primary hover:bg-surface-container-high",
    danger: "bg-error-container/10 text-error hover:bg-error-container/20 border border-error/20",
    ghost: "bg-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface",
    outline: "bg-transparent border-2 border-outline/20 text-on-surface hover:border-primary/50 hover:text-primary",
    none: ""
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    xl: "h-16 px-10 text-xl",
    icon: "w-10 h-10 p-0",
    none: ""
  };

  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    '2xl': "rounded-2xl",
    '3xl': "rounded-3xl",
    full: "rounded-full",
    none: "rounded-none"
  };

  // Default rounded based on size if not provided
  const finalRounded = rounded ? roundedStyles[rounded] : (variant === 'primary' ? 'rounded-full' : 'rounded-2xl');

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], finalRounded, className)} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </div>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
