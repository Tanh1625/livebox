import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inviteApi } from '../../features/server/api/inviteApi';
import { InvitePreviewResponse } from '../../features/server/types';
import { InvitePreviewUI } from '../../features/server/components/InvitePreviewUI';
import { useAuthStore } from '../../features/auth/store/authStore';

export const InvitePreviewPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<InvitePreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!code) {
        setError('Link mời không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await inviteApi.previewInvite(code);
        
        if (res.expiresAt && new Date(res.expiresAt).getTime() < Date.now()) {
          setError('Link mời đã hết hạn');
        } else {
          setData(res);
        }
      } catch (err: any) {
        console.error('Invite preview fetch failed:', err);
        if (err.response?.status === 404) {
          setError('Link mời không tồn tại');
        } else {
          setError('Không thể tải thông tin lời mời. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [code]);

  const handleJoin = async () => {
    if (!code) return;
    try {
      setLoading(true);
      await inviteApi.joinServer(code);
      // After joining, navigate to main app
      navigate('/app/main');
    } catch (err) {
      console.error('Join failed:', err);
      alert('Không thể tham gia server. Có thể bạn đã là thành viên hoặc link đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-headline font-bold tracking-widest uppercase text-sm">Validating Void...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-surface-container-low/90 backdrop-blur-2xl rounded-lg p-10 border border-error/20 shadow-[0_20px_50px_rgba(255,0,0,0.05)] text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-error text-3xl">warning</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">{error}</h2>
          <p className="text-on-surface-variant text-sm mb-8">Vui lòng kiểm tra lại đường dẫn hoặc liên hệ với người gửi.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-surface-container-highest text-on-surface font-bold rounded-full hover:bg-surface-bright transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <InvitePreviewUI 
      data={data} 
      isLoggedIn={isAuthenticated}
      onLogin={() => navigate(`/login?redirect=/invite/${code}`)}
      onJoin={handleJoin}
      onIgnore={() => navigate('/app/main')}
    />
  );
};
