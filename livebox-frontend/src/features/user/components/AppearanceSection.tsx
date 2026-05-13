import React from 'react';

interface AppearanceSectionProps {
  theme: 'LIGHT' | 'DARK';
  onThemeChange: (theme: 'LIGHT' | 'DARK') => void;
  interfaceScaling: number;
  onScalingChange: (value: number) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  theme,
  onThemeChange,
  interfaceScaling,
  onScalingChange
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-3xl font-black font-headline tracking-tighter uppercase mb-1">Appearance</h2>
        <p className="text-sm text-outline/60">Customize the visual harmonics of your interface.</p>
      </header>

      <section className="space-y-6">
        <header className="flex items-center gap-3">
           <div className="w-1 h-4 bg-primary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface/80">Theme Selection</h3>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => onThemeChange('DARK')}
            className={`flex flex-col gap-4 p-6 rounded-3xl border transition-all group relative overflow-hidden ${
              theme === 'DARK' ? 'border-primary/50 bg-surface-container-high shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : 'border-white/5 bg-surface-container-low hover:bg-white/5'
            }`}
          >
            <div className="w-full h-32 bg-[#0b0e14] rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(129,236,255,0.05),transparent)]"></div>
               <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${theme === 'DARK' ? 'bg-primary shadow-[0_0_30px_rgba(129,236,255,0.4)] scale-110' : 'bg-white/5'}`}>
                  <span className={`material-symbols-outlined text-3xl ${theme === 'DARK' ? 'text-on-primary-fixed' : 'text-outline/40'}`}>dark_mode</span>
               </div>
            </div>
            <div className="flex items-center justify-between w-full px-1">
               <div className="text-left">
                  <span className="text-sm font-black uppercase tracking-widest block">Dark Void</span>
                  <span className="text-[10px] text-outline/50 uppercase font-bold">Optimal for low light</span>
               </div>
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${theme === 'DARK' ? 'border-primary bg-primary' : 'border-outline/20'}`}>
                  {theme === 'DARK' && <span className="material-symbols-outlined text-[16px] text-on-primary-fixed font-black">check</span>}
               </div>
            </div>
          </button>

          <button 
            onClick={() => onThemeChange('LIGHT')}
            className={`flex flex-col gap-4 p-6 rounded-3xl border transition-all group relative overflow-hidden ${
              theme === 'LIGHT' ? 'border-primary/50 bg-surface-container-high shadow-[0_20px_40px_rgba(0,0,0,0.1)]' : 'border-white/5 bg-surface-container-low hover:bg-white/5'
            }`}
          >
            <div className="w-full h-32 bg-[#f0f2f5] rounded-2xl border border-black/5 flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${theme === 'LIGHT' ? 'bg-primary shadow-[0_0_30px_rgba(129,236,255,0.4)] scale-110' : 'bg-black/5'}`}>
                  <span className={`material-symbols-outlined text-3xl ${theme === 'LIGHT' ? 'text-on-primary-fixed' : 'text-black/20'}`}>light_mode</span>
               </div>
            </div>
            <div className="flex items-center justify-between w-full px-1">
               <div className="text-left">
                  <span className="text-sm font-black uppercase tracking-widest block">Light Pulse</span>
                  <span className="text-[10px] text-outline/50 uppercase font-bold">High clarity in daylight</span>
               </div>
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${theme === 'LIGHT' ? 'border-primary bg-primary' : 'border-outline/20'}`}>
                  {theme === 'LIGHT' && <span className="material-symbols-outlined text-[16px] text-on-primary-fixed font-black">check</span>}
               </div>
            </div>
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center gap-3">
           <div className="w-1 h-4 bg-secondary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface/80">Interface Scaling</h3>
        </header>

        <div className="bg-surface-container-low rounded-3xl p-8 border border-white/5 space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-wider">Magnification Level</p>
              <p className="text-xs text-outline/60">Global font and component size multiplier.</p>
            </div>
            <div className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
               <span className="text-xl font-black font-headline text-primary drop-shadow-[0_0_8px_rgba(129,236,255,0.4)]">{interfaceScaling}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onScalingChange(Math.max(50, interfaceScaling - 10))}
              className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright transition-all active:scale-90 border border-white/5 shadow-xl group"
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">remove</span>
            </button>
            
            <div className="flex-1 h-4 bg-surface-container-lowest rounded-full relative border border-white/5 p-1 shadow-inner overflow-hidden">
               <div 
                 className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary rounded-full shadow-[0_0_20px_rgba(129,236,255,0.6)] transition-all duration-300 ease-out"
                 style={{ width: `${(interfaceScaling - 50) / (200 - 50) * 100}%` }}
               >
                  <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
               </div>
            </div>

            <button 
              onClick={() => onScalingChange(Math.min(200, interfaceScaling + 10))}
              className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright transition-all active:scale-90 border border-white/5 shadow-xl group text-primary"
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add</span>
            </button>
          </div>
          
          <div className="flex justify-between px-2">
             {['Minimal', 'Standard', 'Maximized'].map((label, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div className="w-1 h-1 bg-outline/20 rounded-full"></div>
                   <span className="text-[9px] font-black text-outline/40 uppercase tracking-[0.2em]">{label}</span>
                </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};
