import React, { useEffect, useState } from 'react';
import { inviteApi } from '../api/inviteApi';
import type { InviteResponse, ServerResponse } from '../types';

interface InviteFriendsModalProps {
  server: ServerResponse;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  server,
  onClose,
  onSuccess,
  onError
}) => {
  const [invite, setInvite] = useState<InviteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setIsLoading(true);
        const data = await inviteApi.generateInvite(server.id);
        setInvite(data);
      } catch (error) {
        console.error('Failed to generate invite:', error);
        onError?.('Could not generate invite link. Please try again.');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  const handleCopy = async () => {
    if (!invite?.inviteUrl) return;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText("http://localhost:5173" + invite.inviteUrl);
      onSuccess?.('Invite link copied to clipboard!');
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      onError?.('Failed to copy to clipboard.');
      setIsCopying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-[70] flex items-center justify-center">
        <div className="w-full max-w-[480px] p-8 glass-morphism bg-surface-container-low/90 rounded-lg flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-medium">Generating invite link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="w-full glass-morphism bg-surface-container-low/90 rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,229,255,0.08)] relative max-w-[480px]">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-secondary to-primary p-[2px]">
                <div className="w-full h-full rounded-full bg-surface-container-low flex items-center justify-center overflow-hidden">
                  {server.avatarUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={server.avatarUrl}
                      alt={server.name}
                    />
                  ) : (
                    <span className="text-primary font-bold text-xl">
                      {server.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h2 className="font-headline font-bold text-2xl tracking-tight text-on-surface leading-tight">
                  Invite Friends to <span className="text-primary italic">{server.name}</span>
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 space-y-6">
          <div className="space-y-3">
            <label className="font-label text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant block ml-1">
              Invite Link
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <div className="flex-grow bg-surface-container-highest/50 border border-white/5 rounded-lg px-4 py-3 flex items-center justify-between group transition-all duration-300 focus-within:border-primary/50 overflow-hidden">
                <span className="text-on-surface/80 font-medium truncate text-sm">
                  {`http://localhost:5173${invite?.inviteUrl}` || 'Loading...'}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-xl ml-2 shrink-0">
                  link
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="whitespace-nowrap px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {isCopying ? 'check' : 'content_copy'}
                </span>
                {isCopying ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer group flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code_2
              </span>
              <span className="text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                QR Code
              </span>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer group flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                share
              </span>
              <span className="text-sm font-semibold text-on-surface group-hover:text-tertiary transition-colors">
                Share
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-high/50 px-8 py-5 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-outline text-lg">info</span>
          <p className="font-label text-sm font-medium text-on-surface-variant/80">
            Only Server Owners can generate new invite links.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
