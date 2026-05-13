import React from 'react';

interface ProfileSectionProps {
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  tier: string;
  onDisplayNameChange: (value: string) => void;
  onChangeAvatar: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  displayName,
  avatarUrl,
  isVerified,
  tier,
  onDisplayNameChange,
  onChangeAvatar
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-3xl font-black font-headline tracking-tighter uppercase mb-1">My Account</h2>
        <p className="text-sm text-outline/60">Manage your identity and synchronization across the void.</p>
      </header>

      {/* Visual Identity Section */}
      <section className="bg-surface-container-low rounded-3xl overflow-hidden border border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        {/* Banner with Rich Texture */}
        <div className="h-36 bg-gradient-to-br from-primary/30 via-secondary/20 to-surface-container-high relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(129,236,255,0.1),transparent)] opacity-50"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20"></div>
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          {/* Avatar overlap - Refined */}
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-[8px] border-surface-container-low bg-surface-container-highest overflow-hidden shadow-2xl relative group/avatar">
              {avatarUrl ? (
                <img alt="Profile" className="w-full h-full object-cover" src={avatarUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-primary bg-gradient-to-br from-surface-container-highest to-surface-container-low">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer" onClick={onChangeAvatar}>
                <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
              </div>
            </div>
            {/* Pulsing Status Dot */}
            <div className="absolute bottom-2 right-2 w-7 h-7 bg-primary rounded-full border-[5px] border-surface-container-low shadow-[0_0_15px_rgba(129,236,255,0.6)]">
               <div className="absolute inset-0 rounded-full animate-ping bg-primary/40 opacity-75"></div>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black font-headline tracking-tight uppercase leading-none">{displayName}</h3>
                <div className="flex gap-1.5">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {tier}
                  </span>
                  {isVerified && (
                    <span className="w-5 h-5 bg-tertiary/20 text-tertiary flex items-center justify-center rounded-full" title="Verified Presence">
                      <span className="material-symbols-outlined text-sm font-bold">verified</span>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-outline/50 font-bold uppercase tracking-widest">
                 ID: {displayName.toLowerCase()}#9920
              </p>
            </div>
            <button 
              onClick={onChangeAvatar}
              className="px-6 py-2.5 bg-surface-container-highest border border-white/5 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-surface-bright transition-all active:scale-95 shadow-lg"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Account Info - Card Grid Style */}
      <section className="bg-surface-container-low/50 rounded-3xl p-8 border border-white/5 space-y-8">
        <header className="flex items-center gap-3 mb-6">
           <div className="w-1 h-4 bg-primary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface/80">Account Security</h3>
        </header>

        <div className="grid gap-3">
          {[
            { label: 'Username', value: displayName.toLowerCase(), action: 'Edit' },
            { label: 'Email', value: 'dotuananh1625@gmail.com', action: 'Edit' },
            { label: 'Password', value: '••••••••••••••••', action: 'Change Password', highlight: true }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-surface-container-lowest/40 hover:bg-surface-container-lowest/60 rounded-2xl border border-white/5 transition-all group">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-outline/60">{item.label}</label>
                <p className="text-sm font-bold tracking-tight text-on-surface/90">{item.value}</p>
              </div>
              <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                item.highlight ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-surface-container-highest/50 text-on-surface-variant hover:text-on-surface'
              }`}>
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Public Profile - Forms */}
      <section className="bg-surface-container-low/50 rounded-3xl p-8 border border-white/5 space-y-8">
         <header className="flex items-center gap-3 mb-6">
           <div className="w-1 h-4 bg-secondary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface/80">Public Details</h3>
         </header>

         <div className="space-y-8">
            <div className="space-y-3">
               <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-outline/60">Display Name</label>
                  <span className="text-[9px] text-outline/30 uppercase tracking-widest">32 Characters Max</span>
               </div>
               <input 
                  className="w-full bg-surface-container-lowest/30 text-on-surface font-bold text-base px-5 py-4 rounded-2xl border border-white/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-inner" 
                  type="text" 
                  value={displayName}
                  onChange={(e) => onDisplayNameChange(e.target.value)}
               />
            </div>
            
            <div className="space-y-3">
               <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-outline/60">About Me</label>
                  <span className="text-[9px] text-outline/30 uppercase tracking-widest">Rich Text Supported</span>
               </div>
               <textarea 
                  className="w-full bg-surface-container-lowest/30 text-on-surface font-medium text-sm px-5 py-4 rounded-2xl border border-white/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all min-h-[140px] resize-none shadow-inner"
                  placeholder="Describe your essence in the void..."
                  defaultValue="Senior Fullstack Developer | Architecting Neon Systems"
               />
            </div>
         </div>
      </section>

      {/* Danger Zone */}
      <section className="p-8 border border-error/20 rounded-3xl bg-error/5 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-error rotate-12">warning</span>
         </div>
         <div className="relative z-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-error mb-2">Eliminate Presence</h3>
            <p className="text-xs text-on-surface/60 max-w-md leading-relaxed mb-6">
               Account deletion is permanent. All servers, connections, and metadata will be purged from the void cluster. This action cannot be reversed.
            </p>
            <button className="px-6 py-2.5 bg-error/10 border border-error/20 text-error rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-lg">
               Delete Account
            </button>
         </div>
      </section>
    </div>
  );
};
