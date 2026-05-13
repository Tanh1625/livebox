import React from 'react';

interface NotificationSectionProps {
  webNotifications: boolean;
  soundAlerts: boolean;
  onWebToggle: () => void;
  onSoundToggle: () => void;
}

export const NotificationSection: React.FC<NotificationSectionProps> = ({
  webNotifications,
  soundAlerts,
  onWebToggle,
  onSoundToggle
}) => {
  const ToggleRow: React.FC<{ label: string; sub: string; active: boolean; onToggle: () => void; icon: string }> = ({ label, sub, active, onToggle, icon }) => (
    <div className="flex items-center justify-between p-6 bg-surface-container-low/60 hover:bg-surface-container-high/60 rounded-3xl border border-white/5 transition-all cursor-pointer group shadow-lg" onClick={onToggle}>
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(129,236,255,0.15)]' : 'bg-surface-container-highest/50 text-outline/40'}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors">{label}</span>
          <span className="text-[11px] text-outline/60 mt-1 leading-relaxed max-w-sm">{sub}</span>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        aria-checked={active} 
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${active ? 'bg-primary shadow-[0_0_15px_rgba(129,236,255,0.4)]' : 'bg-surface-container-highest'}`} 
        role="switch"
      >
        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full ring-0 transition-all duration-300 ease-in-out shadow-xl ${active ? 'translate-x-5 bg-on-primary-fixed' : 'translate-x-0 bg-on-surface-variant'}`}></span>
      </button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-3xl font-black font-headline tracking-tighter uppercase mb-1">Notifications</h2>
        <p className="text-sm text-outline/60">Configure how the void reaches back to you.</p>
      </header>

      <section className="space-y-4">
        <header className="flex items-center gap-3 mb-6">
           <div className="w-1 h-4 bg-primary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface/80">Interaction Signals</h3>
        </header>
        
        <div className="space-y-4">
          <ToggleRow 
            label="Push Transmission"
            sub="Receive real-time desktop push notifications for incoming signals and mentions."
            active={webNotifications}
            onToggle={onWebToggle}
            icon="notifications_active"
          />
          <ToggleRow 
            label="Audio Resonance"
            sub="Play high-fidelity sound effects for new messages and server events."
            active={soundAlerts}
            onToggle={onSoundToggle}
            icon="volume_up"
          />
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex items-center gap-3">
           <div className="w-1 h-4 bg-secondary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface/80">Transmission Schedule</h3>
        </header>

        <div className="bg-surface-container-low/40 rounded-3xl p-8 border border-dashed border-white/10 flex flex-col items-center gap-6 text-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-low/50"></div>
           <div className="w-16 h-16 bg-surface-container-high rounded-3xl flex items-center justify-center text-outline/40 shadow-2xl relative z-10 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
              <span className="material-symbols-outlined text-4xl">bedtime</span>
           </div>
           <div className="relative z-10 space-y-2">
              <p className="text-base font-black uppercase tracking-tight">Quiet Void Mode</p>
              <p className="text-xs text-outline/60 px-10 leading-relaxed max-w-sm">
                 Automatically silence all incoming transmissions during your rest cycle (00:00 — 07:00).
              </p>
           </div>
           <button className="relative z-10 px-8 py-3 bg-surface-container-highest text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-surface-bright hover:text-primary transition-all shadow-xl">
              Enable Schedule
           </button>
        </div>
      </section>
    </div>
  );
};
