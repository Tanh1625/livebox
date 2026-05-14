import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { toast } from '../../../store/useToastStore';

interface JoinServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinServerModal: React.FC<JoinServerModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading] = useState(false);

  const handlePreview = () => {
    const trimmed = inviteCode.trim();
    if (!trimmed) {
      toast.error('Please enter an invite code or URL');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join a Server"
    >
      <div className="space-y-8 py-2">
        <div className="space-y-6">
          <p className="text-sm text-outline/60 -mt-2">Enter an invite code to join an existing cluster.</p>
          
          <Input 
            label="Neural Link ID"
            placeholder="Enter server address..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            icon="link"
            disabled={isLoading}
          />
          
          <div className="bg-surface-container-high/30 p-5 rounded-[1.5rem] border border-white/5 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Protocol Formats</h4>
            <ul className="text-xs text-on-surface-variant space-y-2">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#81ecff]" />
                <code className="text-primary/70 font-mono">h7x8p2</code>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#81ecff]" />
                <code className="text-primary/70 font-mono">https://livebox.gg/invite/h7x8p2</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handlePreview} 
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Transmit Join Signal
          </Button>
          <button 
            onClick={onClose}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-outline/40 hover:text-on-surface transition-colors"
          >
            Cancel Signal
          </button>
        </div>
      </div>
    </Modal>
  );
};
