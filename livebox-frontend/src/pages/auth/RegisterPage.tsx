import React from 'react';
import { RegisterForm } from '../../features/auth/components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient Cinematic Background Effects */}
      <div className="absolute inset-0 pointer-events-none bg-electric-glow z-0"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full z-0"></div>
      <div className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] bg-secondary/15 blur-[160px] rounded-full z-0"></div>
      
      {/* Onboarding Progress Pillars */}
      <div className="fixed top-0 left-0 w-full flex gap-2 p-4 z-50">
        <div className="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
        <div className="h-1 flex-1 bg-primary rounded-full"></div>
        <div className="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
      </div>

      <main className="flex-grow flex items-center justify-center p-6 z-10 relative">
        <RegisterForm />
      </main>

      {/* Decorative Corner Graphics */}
      <div className="fixed bottom-10 left-10 opacity-20 pointer-events-none">
        <div className="grid grid-cols-4 gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
        </div>
      </div>
    </div>
  );
};
