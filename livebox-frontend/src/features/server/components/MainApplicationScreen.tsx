import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { serverApi } from '../api/serverApi';
import type { MemberStatusResponse, ServerResponse } from '../types';
import { channelApi } from '../../channel/api/channelApi';
import type { ChannelResponse } from '../../channel/types';
import { useWebSocket } from '../../chat/hooks/useWebSocket';

import { JoinServerModal } from './JoinServerModal';
import { messageApi } from '../../chat/api/messageApi';
import type { MessageResponse } from '../../chat/types';
import { VoiceRoomTest } from '../../channel/components/VoiceRoomTest';

// New specialized components
import { ServerSidebar } from './ServerSidebar';
import { MemberList } from './MemberList';
import { ChannelSidebar } from '../../channel/components/ChannelSidebar';
import { MessageList } from '../../chat/components/MessageList';
import { MessageInput } from '../../chat/components/MessageInput';

export const MainApplicationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinedServers, setJoinedServers] = useState<ServerResponse[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Responsive state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileMembersOpen, setIsMobileMembersOpen] = useState(false);

  // Message state
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [members, setMembers] = useState<MemberStatusResponse[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fetch members logic
  const fetchMembers = useCallback(async (showLoading = true) => {
    if (!selectedServerId) {
      setMembers([]);
      return;
    }
    try {
      if (showLoading) setIsLoadingMembers(true);
      const data = await serverApi.getServerMembers(selectedServerId);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      if (showLoading) setIsLoadingMembers(false);
    }
  }, [selectedServerId]);

  // Initial fetch when server changes
  useEffect(() => {
    fetchMembers(true);
  }, [fetchMembers]);

  const selectedServer = useMemo(() =>
    joinedServers.find(s => s.id === selectedServerId),
    [joinedServers, selectedServerId]
  );

  // Fetch messages logic
  const fetchMessages = useCallback(async (showLoader = true) => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }

    try {
      if (showLoader) setIsLoadingMessages(true);
      const data = await messageApi.getMessages(activeChannelId);

      if (data && Array.isArray(data.content)) {
        setMessages([...data.content].reverse());
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      if (showLoader) setIsLoadingMessages(false);
    }
  }, [activeChannelId]);

  // Fetch messages when channel changes
  useEffect(() => {
    void fetchMessages(true);
  }, [fetchMessages]);

  // WebSocket integration
  const { sendMessage } = useWebSocket({
    channelId: activeChannelId,
    serverId: selectedServerId,
    onMessageReceived: (newMsg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    },
    onMemberStatusChanged: () => {
      void fetchMembers(false);
    }
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const sent = sendMessage(messageInput.trim());
    if (sent) {
      setMessageInput('');
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    setIsSettingsOpen(false);
    logout();
    navigate('/login');
  };

  const handleViewOwnedServers = () => {
    setIsSettingsOpen(false);
    navigate('/servers/owned');
  };

  const handleCreateServer = () => {
    navigate('/servers/create');
  };

  useEffect(() => {
    let isMounted = true;
    const loadJoinedServers = async () => {
      try {
        const servers = await serverApi.getMyServers();
        if (isMounted) {
          setJoinedServers(servers);
          if (servers.length > 0 && !selectedServerId) {
            setSelectedServerId(servers[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load joined servers:', error);
      }
    };
    loadJoinedServers();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (selectedServerId) {
      const loadChannels = async () => {
        try {
          const data = await channelApi.getChannels(selectedServerId);
          setChannels(data);
          if (data.length > 0) {
            setActiveChannelId(data[0].id);
          }
        } catch (error) {
          console.error('Failed to load channels:', error);
        }
      };
      loadChannels();
    } else {
      setChannels([]);
      setActiveChannelId(null);
    }
  }, [selectedServerId]);

  const activeChannel = useMemo(() => 
    channels.find(c => c.id === activeChannelId),
    [channels, activeChannelId]
  );

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden">
      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Left Navigation (Servers + Channels) */}
      <div className={`fixed inset-y-0 left-0 z-50 flex transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <ServerSidebar 
          servers={joinedServers}
          selectedServerId={selectedServerId}
          onServerSelect={(id) => setSelectedServerId(id)}
          onCreateServer={handleCreateServer}
        />

        <ChannelSidebar 
          channels={channels}
          activeChannelId={activeChannelId}
          onChannelSelect={(id) => {
            setActiveChannelId(id);
            setIsMobileNavOpen(false);
          }}
          serverName={selectedServer?.name || 'LiveBox'}
        />

        {/* User Profile Footer (Part of Navigation) */}
        <footer className="absolute bottom-0 left-[72px] right-0 p-3 bg-surface-container-lowest/30 backdrop-blur-md flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary border border-outline-variant/20 shadow-md">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full ring-2 ring-surface shadow-[0_0_8px_#81ecff]"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">
              {user?.email ? user.email.split('@')[0] : 'Guest'}
            </p>
            <p className="text-[10px] text-outline truncate tracking-wider uppercase font-headline">Ignition Active</p>
          </div>
          <div className="flex gap-1 relative">
            <button type="button" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-outline hover:text-primary active:scale-95">
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-outline hover:text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 bottom-12 w-56 rounded-xl border border-outline-variant/30 bg-surface-container-high shadow-[0_12px_28px_rgba(0,0,0,0.45)] p-1 z-20">
                <button
                  type="button"
                  onClick={handleViewOwnedServers}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-white/5 transition-colors"
                >
                  My Servers
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-error hover:bg-error/15 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </footer>
      </div>

      <main className="flex-1 flex flex-col bg-surface overflow-hidden relative z-0">
        {activeChannel?.type === 'VOICE' ? (
          <VoiceRoomTest
            channelId={activeChannelId!}
            channelName={activeChannel.name}
            onLeave={() => setActiveChannelId(null)}
          />
        ) : (
          <>
            <header className="h-16 px-4 md:px-6 flex items-center justify-between shrink-0 bg-surface/60 backdrop-blur-2xl z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setIsMobileNavOpen(true)}
                  className="md:hidden p-1 mr-1 text-outline hover:text-primary hover:bg-white/5 rounded-lg transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined text-2xl">menu</span>
                </button>
                <span className="text-2xl font-medium text-outline hidden sm:inline">#</span>
                <h2 className="font-headline font-bold text-lg text-on-surface truncate max-w-[150px] sm:max-w-none">
                  {activeChannel?.name || 'general'}
                </h2>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center bg-surface-container-high px-4 py-1.5 rounded-full gap-2 w-48 md:w-64 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-lg text-outline">search</span>
                  <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-outline w-full" placeholder="Search..." type="text" />
                </div>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="flex items-center justify-center p-1 rounded-lg text-outline hover:text-primary hover:bg-white/5 transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined">group_add</span>
                </button>
                <button
                  onClick={() => setIsMobileMembersOpen(true)}
                  className="lg:hidden flex items-center justify-center p-1 rounded-lg text-outline hover:text-primary hover:bg-white/5 transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined">group</span>
                </button>
              </div>
            </header>

            <MessageList 
              messages={messages}
              isLoading={isLoadingMessages}
              currentUserId={user?.id}
              activeChannelName={activeChannel?.name || 'channel'}
              messagesEndRef={messagesEndRef}
            />

            <MessageInput 
              value={messageInput}
              onChange={setMessageInput}
              onSubmit={handleSendMessage}
              placeholder={`Message #${activeChannel?.name || 'channel'}`}
            />
          </>
        )}
      </main>

      {/* Mobile Members Overlay */}
      {isMobileMembersOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMembersOpen(false)}
        />
      )}

      {/* Right Sidebar (Members) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-60 bg-surface-container-low shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMembersOpen ? 'translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]' : 'translate-x-full lg:translate-x-0'} ${isMobileMembersOpen ? 'flex' : 'hidden lg:flex'}`}>
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/5 shrink-0 lg:hidden justify-between">
          <h3 className="font-headline font-bold text-on-surface">Members</h3>
          <button onClick={() => setIsMobileMembersOpen(false)} className="p-1 text-outline hover:text-primary">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <MemberList 
          members={members}
          isLoading={isLoadingMembers}
        />
      </aside>

      <JoinServerModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
};
