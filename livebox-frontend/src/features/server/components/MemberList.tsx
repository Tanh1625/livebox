import React from 'react';
import { MemberStatusResponse } from '../types';

interface MemberListProps {
  members: MemberStatusResponse[];
  isLoading: boolean;
  onClose?: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  isLoading,
  // onClose
}) => {
  const onlineMembers = members.filter(m => m.online);
  const offlineMembers = members.filter(m => !m.online);

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {isLoading ? (
        <div className="flex flex-col items-center py-10 gap-2 opacity-50">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase tracking-widest font-headline">Scanning...</p>
        </div>
      ) : (
        <>
          {onlineMembers.length > 0 && (
            <section className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline mb-4">
                Online — {onlineMembers.length}
              </h3>
              <div className="space-y-4">
                {onlineMembers.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex-shrink-0">
                      {member.avatarUrl ? (
                        <img
                          className="w-8 h-8 rounded-full object-cover group-hover:ring-2 ring-primary ring-offset-2 ring-offset-surface transition-all"
                          alt={member.displayName}
                          src={member.avatarUrl}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary text-xs border border-outline-variant/20">
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {member.displayName}
                      </p>
                      <p className="text-[10px] text-outline truncate uppercase tracking-tighter">
                        {member.role === 'OWNER' ? 'System Admin' : 'Inhabitant'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {offlineMembers.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline mb-4">
                Offline — {offlineMembers.length}
              </h3>
              <div className="space-y-4 opacity-50">
                {offlineMembers.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3 grayscale group cursor-not-allowed">
                    <div className="relative flex-shrink-0">
                      {member.avatarUrl ? (
                        <img
                          className="w-8 h-8 rounded-full object-cover"
                          alt={member.displayName}
                          src={member.avatarUrl}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-outline text-xs border border-outline-variant/20">
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-outline rounded-full ring-2 ring-surface-container-low"></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-outline truncate">
                        {member.displayName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {members.length === 0 && (
            <div className="py-10 text-center opacity-40">
              <p className="text-[10px] uppercase tracking-widest font-headline">Alone in the void</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
