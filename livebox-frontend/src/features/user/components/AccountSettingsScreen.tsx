import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileSection } from './ProfileSection';
import { AppearanceSection } from './AppearanceSection';
import { NotificationSection } from './NotificationSection';
import { useAuthStore } from '../../auth/store/authStore';

type SettingsTab = 'MY_ACCOUNT' | 'APPEARANCE' | 'NOTIFICATIONS' | 'PRIVACY' | 'VOICE';

export const AccountSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('MY_ACCOUNT');
  
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || 'DOTUANANH1625');
  const [theme, setTheme] = useState<'LIGHT' | 'DARK'>('DARK');
  const [scaling, setScaling] = useState(100);
  const [webNotifications, setWebNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  const SidebarItem: React.FC<{ id: SettingsTab; label: string; danger?: boolean }> = ({ id, label, danger }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150 mb-0.5 group ${
        activeTab === id
          ? 'bg-primary/10 text-primary font-bold shadow-[inset_0_0_10px_rgba(129,236,255,0.05)]'
          : danger 
            ? 'text-error hover:bg-error/10 hover:text-error' 
            : 'text-on-surface-variant/80 hover:bg-white/5 hover:text-on-surface'
      }`}
    >
      <span className="flex items-center justify-between">
        {label}
        {activeTab === id && <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(129,236,255,0.8)]" />}
      </span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'MY_ACCOUNT':
        return (
          <ProfileSection 
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            tier="Pro"
            isVerified={true}
            avatarUrl={user?.avatarUrl}
            onChangeAvatar={() => console.log('Change avatar clicked')}
          />
        );
      case 'APPEARANCE':
        return (
          <AppearanceSection 
            theme={theme}
            onThemeChange={setTheme}
            interfaceScaling={scaling}
            onScalingChange={setScaling}
          />
        );
      case 'NOTIFICATIONS':
        return (
          <NotificationSection 
            webNotifications={webNotifications}
            soundAlerts={soundAlerts}
            onWebToggle={() => setWebNotifications(!webNotifications)}
            onSoundToggle={() => setSoundAlerts(!soundAlerts)}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 border-2 border-dashed border-outline-variant/10 rounded-3xl mx-6">
            <span className="material-symbols-outlined text-6xl mb-4">construction</span>
            <p className="font-headline uppercase tracking-[0.3em] text-[10px] font-black">Transmission Interrupted</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-surface-dim text-on-surface h-screen flex overflow-hidden font-body selection:bg-primary/30">
      {/* Settings Sidebar */}
      <aside className="w-[260px] bg-surface-container-low/50 backdrop-blur-3xl flex flex-col pt-16 shrink-0 overflow-y-auto items-end border-r border-outline-variant/5">
        <div className="w-[218px] px-2 pr-4 space-y-8">
          <section>
            <h3 className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-outline/60 font-headline">User Settings</h3>
            <div className="space-y-0.5">
              <SidebarItem id="MY_ACCOUNT" label="My Account" />
              <SidebarItem id="PRIVACY" label="Privacy & Safety" />
            </div>
          </section>

          <section>
            <h3 className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-outline/60 font-headline">App Settings</h3>
            <div className="space-y-0.5">
              <SidebarItem id="APPEARANCE" label="Appearance" />
              <SidebarItem id="NOTIFICATIONS" label="Notifications" />
              <SidebarItem id="VOICE" label="Voice & Video" />
            </div>
          </section>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent my-6 mx-3"></div>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-error/80 hover:bg-error/10 hover:text-error transition-all font-medium flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Log Out
          </button>
          
          <div className="px-3 py-8">
            <p className="text-[10px] text-outline/40 uppercase tracking-widest font-black">LiveBox Ignite</p>
            <p className="text-[9px] text-outline/30 mt-1">Stable v1.0.4 (992) — 2026-05-13</p>
          </div>
        </div>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 bg-surface relative flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[800px] w-full mx-auto px-10 py-16 pb-40">
            {renderContent()}
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[700px] px-4 z-50">
          <div className="bg-surface-container-high/80 backdrop-blur-2xl rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(129,236,255,1)]" />
              <p className="text-sm font-bold tracking-tight">Careful — you have unsaved changes!</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-5 py-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => console.log('Saved')}
                className="px-8 py-2 bg-primary text-on-primary-fixed rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(129,236,255,0.3)] hover:shadow-[0_4px_25px_rgba(129,236,255,0.5)] hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Exit Button Container */}
      <div className="w-[100px] bg-surface shrink-0 pt-16 flex justify-center">
        <button 
          onClick={() => navigate('/app/main')}
          className="group flex flex-col items-center gap-3 h-fit"
        >
          <div className="w-10 h-10 rounded-full border-2 border-outline/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300 group-hover:rotate-90">
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-2xl">close</span>
          </div>
          <span className="text-[10px] font-black text-outline/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Esc</span>
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
};
