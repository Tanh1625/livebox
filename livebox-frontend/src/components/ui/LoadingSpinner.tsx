import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  fullScreen = false,
}) => {
  const containerClasses = fullScreen
    ? "flex h-screen w-screen flex-col items-center justify-center bg-slate-900/95"
    : "flex h-full w-full flex-col items-center justify-center p-4 bg-slate-900/50 rounded-lg";

  return (
    <div className={containerClasses}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-blue-400 mb-4"></div>
      <span className="text-blue-100 font-body font-medium tracking-wide">
        {message}
      </span>
    </div>
  );
};
