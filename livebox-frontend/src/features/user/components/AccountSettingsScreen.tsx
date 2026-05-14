import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { userApi } from '../api/userApi';
import { UserProfileUpdateRequest } from '../types';
import { AppearanceSection } from './AppearanceSection';
import { NotificationSection } from './NotificationSection';
import { ProfileSection } from './ProfileSection';
import { toast } from '@/store/useToastStore';
import { authApi } from '../../auth/api/authApi';

type SettingsTab = 'MY_ACCOUNT' | 'APPEARANCE' | 'NOTIFICATIONS' | 'PRIVACY' | 'VOICE';

export const AccountSettingsScreen: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Backend logout failed', err);
    }
    logout();
    navigate('/login');
  };
  const [activeTab, setActiveTab] = useState<SettingsTab>('MY_ACCOUNT');
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  
  // Sync with store when user data becomes available
  useEffect(() => {
    if (user) {
      setDisplayName(prev => prev || user.displayName || user.email?.split('@')[0] || '');
      setBio(prev => prev || user.bio || '');
      setAvatarPreview(prev => prev || user.avatarUrl);
    }
  }, [user]);
  
  const [theme, setTheme] = useState<'LIGHT' | 'DARK'>('DARK');
  const [scaling, setScaling] = useState(100);
  const [webNotifications, setWebNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const fullProfile = await userApi.getProfile();
        updateUser(fullProfile);
        
        // Update local state with fetched profile data
        setDisplayName(fullProfile.displayName || user?.email?.split('@')[0] || '');
        setBio(fullProfile.bio || '');
        setAvatarPreview(fullProfile.avatarUrl);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []); // Run once on mount


  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updateData: UserProfileUpdateRequest = {
        displayName,
        bio,
        avatar: avatarFile || undefined
      };
      
      const updatedUser = await userApi.updateProfile(updateData);
      updateUser(updatedUser);
      setAvatarPreview(updatedUser.avatarUrl);
      setAvatarFile(null);
      toast.success('Identity synchronized successfully');
    } catch (error : any) {
      console.error('Failed to update profile:', error);
      const message = error.response?.data?.message || 'Failed to update identity';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };


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
            userId={user?.id || ''}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            bio={bio}
            onBioChange={setBio}
            tier="Pro"
            isVerified={true}
            avatarUrl={avatarPreview}
            onAvatarChange={handleAvatarChange}
            email={user?.email || ''}
            onSave={handleSave}
            isSaving={isSaving}
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
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-error/80 hover:bg-error/10 hover:text-error transition-all font-medium flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Log Out
          </button>
          
          <div className="px-3 py-8">
            <p className="text-[10px] text-outline/40 uppercase tracking-widest font-black">LiveBox Ignite</p>
            <p className="text-[9px] text-outline/30 mt-1">Stable v1.0.4 (992) — 2026-05-14</p>
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
