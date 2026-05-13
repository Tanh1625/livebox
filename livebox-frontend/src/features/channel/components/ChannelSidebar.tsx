import React from 'react';
import { ChannelResponse } from '../types';

interface ChannelSidebarProps {
  channels: ChannelResponse[];
  activeChannelId: string | null;
  onChannelSelect: (id: string) => void;
  serverName: string;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  channels,
  activeChannelId,
  onChannelSelect,
  serverName
}) => {
  const textChannels = channels.filter(c => c.type === 'TEXT');
  const voiceChannels = channels.filter(c => c.type === 'VOICE');

  return (
    <nav className="w-[280px] bg-surface-container-low flex flex-col shrink-0">
      <header className="h-16 px-4 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-xl shrink-0 border-b border-outline-variant/5">
        <h1 className="font-headline text-lg font-bold tracking-tight text-primary drop-shadow-[0_0_8px_rgba(129,236,255,0.4)] truncate max-w-[200px]">
          {serverName}
        </h1>
        <span className="material-symbols-outlined text-outline cursor-pointer hover:text-on-surface transition-colors">expand_more</span>
      </header>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {/* Text Channels Section */}
        {textChannels.length > 0 && (
          <div>
            <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline flex items-center justify-between group">
              <span>Text Channels</span>
              <span className="material-symbols-outlined text-sm cursor-pointer opacity-0 group-hover:opacity-100 hover:text-primary transition-all">add</span>
            </h3>
            <div className="space-y-0.5">
              {textChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer group/channel ${activeChannelId === channel.id
                      ? 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold shadow-[inset_0_0_15px_rgba(129,236,255,0.1)]'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                    }`}
                >
                  <span className={`text-xl font-medium transition-opacity ${activeChannelId === channel.id ? 'opacity-100' : 'opacity-40 group-hover/channel:opacity-70'}`}>#</span>
                  <span className="text-sm truncate">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Channels Section */}
        {voiceChannels.length > 0 && (
          <div>
            <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline flex items-center justify-between group">
              <span>Voice Channels</span>
              <span className="material-symbols-outlined text-sm cursor-pointer opacity-0 group-hover:opacity-100 hover:text-primary transition-all">add</span>
            </h3>
            <div className="space-y-0.5">
              {voiceChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer group/voice ${
                    activeChannelId === channel.id
                      ? 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold shadow-[inset_0_0_15px_rgba(129,236,255,0.1)]'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg opacity-60 group-hover/voice:opacity-100">volume_up</span>
                    <span className="text-sm truncate">{channel.name}</span>
                  </div>
                  {activeChannelId === channel.id && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#81ecff]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {channels.length === 0 && (
          <div className="px-4 py-10 text-center space-y-2">
            <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-outline/30">
              <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
            </div>
            <p className="text-xs text-outline font-medium">No channels found</p>
          </div>
        )}
      </div>
    </nav>
  );
};
