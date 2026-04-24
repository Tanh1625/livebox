import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface JoinServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinServerModal: React.FC<JoinServerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreview = () => {
    const trimmed = inviteCode.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã mời');
      return;
    }

    // Extract code from URL if needed
    let code = trimmed;
    if (code.includes('/invite/')) {
      code = code.split('/invite/').pop()?.split('?')[0] || code;
    }

    onClose();
    navigate(`/invite/${code}`);
  };

  return (
    <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] glass-morphism bg-surface-container-low/90 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.45)] border border-outline-variant/20">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-headline text-on-surface tracking-tight">Join a Server</h2>
            <p className="text-on-surface-variant text-sm mt-1">Enter an invite code to join an existing cluster.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-4">
            <Input
              label="Invite Code"
              placeholder="e.g. HT-789-XP"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              icon="link"
              error={error || undefined}
              disabled={isLoading}
            />
            
            <div className="bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Example formats</h4>
              <ul className="text-xs text-on-surface-variant space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  h7x8p2
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  https://livebox.gg/invite/h7x8p2
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-surface-container-low/50 flex flex-col gap-3">
          <Button 
            onClick={handlePreview} 
            isLoading={isLoading}
            className="w-full py-4 text-sm font-bold tracking-widest uppercase"
          >
            Check Invitation
          </Button>
          <button 
            onClick={onClose}
            className="w-full py-3 text-xs font-semibold text-outline hover:text-on-surface transition-colors"
          >
            Back to Base
          </button>
        </div>
      </div>
    </div>
  );
};
