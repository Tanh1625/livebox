import React from 'react';
import { MessageResponse } from '../types';

interface MessageListProps {
  messages: MessageResponse[];
  isLoading: boolean;
  currentUserId: string | undefined;
  activeChannelName: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  currentUserId,
  activeChannelName,
  messagesEndRef
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-outline text-sm font-headline tracking-widest uppercase">Deciphering signals...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center opacity-60 py-20">
        <div className="w-24 h-24 bg-surface-container-highest/50 rounded-full flex items-center justify-center mb-8 border border-outline-variant/10 shadow-xl">
          <span className="material-symbols-outlined text-5xl text-primary animate-pulse">forum</span>
        </div>
        <h3 className="text-on-surface font-black text-3xl font-headline tracking-tight mb-3">The beginning of a new cluster</h3>
        <p className="text-on-surface-variant max-w-sm leading-relaxed">
          Welcome to the <span className="text-primary font-bold">#{activeChannelName}</span> channel.
          Start the conversation and ignite the void.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
      {messages.map((msg) => {
        const isMine = currentUserId === msg.sender.id;
        return (
          <div key={msg.id} className={`flex gap-4 group hover:bg-white/5 px-2 py-1 rounded-xl transition-all duration-300 ${isMine ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center font-bold text-primary border border-outline-variant/20 shadow-md">
              {(msg.sender.displayName || '?').charAt(0).toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                <span className="font-bold text-on-surface hover:text-primary transition-colors cursor-pointer text-sm">
                  {msg.sender.displayName}
                </span>
                <span className="text-[10px] text-outline font-headline uppercase tracking-[0.1em]">
                  {new Date(msg.createdAt).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className={`max-w-[80%] p-3 text-sm leading-relaxed shadow-sm border border-white/5 transition-all duration-300 ${isMine
                  ? 'bg-primary text-on-primary rounded-l-2xl rounded-tr-2xl'
                  : 'bg-surface-container-high/80 text-on-surface rounded-r-2xl rounded-tl-2xl'
                }`}>
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
