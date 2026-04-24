import React from 'react';
import { InvitePreviewResponse } from '../types';

interface InvitePreviewUIProps {
  data: InvitePreviewResponse;
  onJoin?: () => void;
  onLogin?: () => void;
  onIgnore?: () => void;
  isLoggedIn?: boolean;
}

export const InvitePreviewUI: React.FC<InvitePreviewUIProps> = ({ data, onJoin, onLogin, onIgnore, isLoggedIn }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full z-0"></div>

      <div className="w-full max-w-[480px] bg-surface-container-low/90 backdrop-blur-2xl rounded-lg p-10 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center text-center">
        {/* Server Avatar */}
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-secondary/20 to-primary/20 p-[2px] mb-8 shadow-xl">
          <div className="w-full h-full rounded-[2rem] bg-surface-container-high flex items-center justify-center overflow-hidden">
            {data.serverAvatarUrl ? (
              <img 
                src={data.serverAvatarUrl} 
                alt={data.serverName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-primary">
                {data.serverName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Invitation Text */}
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-tight mb-2">
          Bạn được mời vào <span className="text-primary italic">{data.serverName}</span>
        </h1>
        
        <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm mb-10 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          {data.memberCount} THÀNH VIÊN
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          {!isLoggedIn ? (
            <button 
              onClick={onLogin}
              className="w-full py-4 bg-primary text-background-dark font-black rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(129,236,255,0.3)] text-lg"
            >
              Đăng nhập để tham gia
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onJoin}
                className="py-3 px-6 bg-primary text-background-dark font-bold rounded-full hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Tham gia ngay
              </button>
              <button 
                onClick={onIgnore}
                className="py-3 px-6 bg-transparent text-outline font-bold rounded-full border border-outline/20 hover:bg-white/5 active:scale-95 transition-all"
              >
                {data.alreadyMember ? 'Quay lại' : 'Bỏ qua'}
              </button>
            </div>
          )}
          
          {!isLoggedIn && (
            <div className="grid grid-cols-1">
              <button 
                disabled
                className="py-3 px-6 bg-transparent text-outline font-bold rounded-full border border-outline/20 opacity-50 cursor-not-allowed"
              >
                Tham gia với tư cách khách
              </button>
            </div>
          )}
        </div>

        <p className="mt-10 text-xs text-on-surface-variant/60 leading-relaxed max-w-[280px]">
          Bằng cách tham gia, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Quyền riêng tư của chúng tôi.
        </p>
      </div>
    </div>
  );
};
