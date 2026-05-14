import React, { useState } from 'react';
import { userApi } from '../api/userApi';
import { toast } from '../../../store/useToastStore';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { 
  Check, 
  Camera, 
  Lock, 
  AlertTriangle,
  Shield
} from 'lucide-react';

interface ProfileSectionProps {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  isVerified: boolean;
  tier: string;
  email: string;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onAvatarChange: (file: File) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userId,
  displayName,
  bio,
  avatarUrl,
  isVerified,
  tier,
  email,
  onDisplayNameChange,
  onBioChange,
  onAvatarChange,
  onSave,
  isSaving
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [imgError, setImgError] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success('ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgError(false); // Reset error state on new file
      onAvatarChange(file);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await userApi.changePassword({ currentPassword, newPassword });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
        accept="image/*"
      />
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
              {avatarUrl && !imgError ? (
                <img 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" 
                  src={avatarUrl} 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-primary bg-gradient-to-br from-surface-container-highest to-surface-container-low">
                  {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer" onClick={handleAvatarClick}>
                  <Camera className="text-white w-8 h-8" />
                </div>
              )}
            </div>
            {/* Pulsing Status Dot */}
            <div className="absolute bottom-2 right-2 w-7 h-7 bg-primary rounded-full border-[5px] border-surface-container-low shadow-[0_0_15px_rgba(129,236,255,0.6)]">
               <div className="absolute inset-0 rounded-full animate-ping bg-primary/40 opacity-75"></div>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1 pr-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input 
                      className="text-2xl font-black font-headline tracking-tight uppercase leading-none bg-surface-container-highest/50 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-primary/50 transition-all w-full max-w-[400px]"
                      value={displayName}
                      onChange={(e) => onDisplayNameChange(e.target.value)}
                      maxLength={32}
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-2xl font-black font-headline tracking-tight uppercase leading-none">{displayName || 'Unnamed User'}</h3>
                  )}
                  <div className="flex gap-1.5 shrink-0">
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
                <div className="flex items-center gap-2 group/id">
                  <p className="text-[11px] text-outline/50 font-bold uppercase tracking-widest">
                     ID: {userId.substring(0, 8)}...
                  </p>
                  <button 
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-white/5 transition-all relative overflow-hidden"
                    title="Copy full ID"
                  >
                    <span className={`material-symbols-outlined text-[14px] transition-all duration-300 ${copied ? 'text-primary scale-110' : 'text-outline/30 group-hover/id:text-outline/60'}`}>
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied && (
                      <span className="text-[9px] font-black uppercase tracking-tighter text-primary animate-in slide-in-from-left-2 duration-300">
                        Copied
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Bio Integrated into Identity Card */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-outline/40">About Me</label>
                </div>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-surface-container-highest/30 text-on-surface font-medium text-sm px-4 py-3 rounded-2xl border border-white/5 focus:border-primary/30 outline-none transition-all min-h-[100px] resize-none shadow-inner"
                    placeholder="Describe your essence in the void..."
                    value={bio}
                    onChange={(e) => onBioChange(e.target.value)}
                    maxLength={255}
                  />
                ) : (
                  <p className="text-sm text-on-surface/70 leading-relaxed whitespace-pre-wrap">
                    {bio || "This entity has not yet transmitted a bio-signature."}
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={async () => {
                if (isEditing && onSave) {
                  await onSave();
                }
                setIsEditing(!isEditing);
              }}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg border disabled:opacity-50 ${
                isEditing 
                  ? 'bg-primary text-on-primary-fixed border-primary/20 shadow-[0_0_20px_rgba(129,236,255,0.3)]' 
                  : 'bg-surface-container-highest border-white/5 hover:bg-surface-bright'
              }`}
            >
              {isSaving ? 'Saving...' : (isEditing ? 'Done Editing' : 'Edit Profile')}
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
            // { label: 'Display Name', value: displayName.toLowerCase(), action: 'Edit', onClick: () => {} },
            { label: 'Email', value: email, action: 'Edit', onClick: () => {} },
            { label: 'Password', value: '••••••••••••••••', action: 'Change Password', highlight: true, onClick: () => setShowPasswordModal(true) }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-surface-container-lowest/40 hover:bg-surface-container-lowest/60 rounded-2xl border border-white/5 transition-all group">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-outline/60">{item.label}</label>
                <p className="text-sm font-bold tracking-tight text-on-surface/90">{item.value}</p>
              </div>
              <button 
                onClick={item.onClick}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                item.highlight ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-surface-container-highest/50 text-on-surface-variant hover:text-on-surface'
              }`}>
                {item.action}
              </button>
            </div>
          ))}
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

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Protocol: Change Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-6 py-2">
          {passwordError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {passwordError}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline/40 ml-1">Current Password</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface-container-highest/30 text-on-surface px-5 py-4 rounded-2xl border border-white/5 focus:border-primary/30 outline-none transition-all shadow-inner"
                placeholder="Enter current password"
              />
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/20 group-focus-within:text-primary transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline/40 ml-1">New Password</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-container-highest/30 text-on-surface px-5 py-4 rounded-2xl border border-white/5 focus:border-primary/30 outline-none transition-all shadow-inner"
                placeholder="New security key"
              />
              <Shield className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/20 group-focus-within:text-primary transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline/40 ml-1">Confirm New Password</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-highest/30 text-on-surface px-5 py-4 rounded-2xl border border-white/5 focus:border-primary/30 outline-none transition-all shadow-inner"
                placeholder="Verify security key"
              />
              <Check className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/20 group-focus-within:text-primary transition-colors" />
            </div>
          </div>
          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-outline/40 hover:text-on-surface transition-colors"
            >
              Abort
            </button>
            <Button 
              type="submit"
              isLoading={isChangingPassword}
              className="flex-1"
              size="lg"
            >
              Update Key
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
