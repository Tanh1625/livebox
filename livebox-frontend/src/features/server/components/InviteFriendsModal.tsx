import React, { useEffect, useState } from 'react';
import { inviteApi } from '../api/inviteApi';
import type { InviteResponse, ServerResponse } from '../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { toast } from '@/store/useToastStore';
import { Copy, Check, Link2, QrCode, Share2, Info } from 'lucide-react';

interface InviteFriendsModalProps {
  server: ServerResponse;
  onClose: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  server,
  onClose
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
        toast.error('Could not generate invite link. Please try again.');
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
      const fullUrl = window.location.origin + invite.inviteUrl;
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard.');
      setIsCopying(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Summon Allies"
    >
      <div className="space-y-8 py-2">
        {isLoading ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(0,229,255,0.2)]"></div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-outline/60 animate-pulse">Encoding Invite Signal...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-5 p-5 bg-surface-container-high/30 rounded-[2rem] border border-white/5 shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary/20 to-primary/20 p-px">
                <div className="w-full h-full rounded-2xl bg-surface-container-low flex items-center justify-center overflow-hidden shadow-2xl">
                  {server.avatarUrl ? (
                    <img className="w-full h-full object-cover" src={server.avatarUrl} alt={server.name} />
                  ) : (
                    <span className="text-primary font-black text-2xl font-headline italic">{server.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-on-surface uppercase tracking-tight truncate leading-tight">
                  {server.name}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-outline/40 mt-1">Operational Cluster</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-outline/60 ml-1">Transmission Link</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface-container-highest/50 border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between group transition-all duration-300 focus-within:border-primary/30 overflow-hidden shadow-inner">
                  <span className="text-on-surface/80 font-medium truncate text-sm font-mono tracking-tight">
                    {`${window.location.origin}${invite?.inviteUrl}` || 'Generating...'}
                  </span>
                  <Link2 className="w-4 h-4 text-outline/30 group-hover:text-primary transition-colors ml-3 shrink-0" />
                </div>
                <Button 
                  onClick={handleCopy} 
                  variant={isCopying ? 'secondary' : 'primary'}
                  className="w-32 h-[56px] rounded-2xl"
                  leftIcon={isCopying ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                >
                  {isCopying ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-surface-container-high/30 hover:bg-surface-container-high/60 transition-all border border-white/5 group shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-outline/60 group-hover:text-secondary">QR Code</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-surface-container-high/30 hover:bg-surface-container-high/60 transition-all border border-white/5 group shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-outline/60 group-hover:text-tertiary">Broadcast</span>
              </button>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-surface-container-high/20 rounded-2xl border border-white/5">
              <Info className="w-4 h-4 text-outline/40" />
              <p className="text-[10px] font-bold text-outline/50 uppercase tracking-tight">
                Only High-Level Entities can generate persistent signals.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default InviteFriendsModal;
