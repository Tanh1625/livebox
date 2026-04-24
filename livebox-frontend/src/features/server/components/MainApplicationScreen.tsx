import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { serverApi } from '../api/serverApi';
import type { ServerResponse } from '../types';
import { channelApi } from '../../channel/api/channelApi';
import type { ChannelResponse } from '../../channel/types';
import { useWebSocket } from '../../../hooks/useWebSocket';

import { JoinServerModal } from './JoinServerModal';
import { messageApi } from '../../message/api/messageApi';
import type { MessageResponse } from '../../message/types';

export const MainApplicationScreen: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinedServers, setJoinedServers] = useState<ServerResponse[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  
  // Message state
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedServer = useMemo(() => 
    joinedServers.find(s => s.id === selectedServerId), 
    [joinedServers, selectedServerId]
  );


  const textChannels = useMemo(() => 
    channels.filter(c => c.type === 'TEXT'), 
    [channels]
  );

  const voiceChannels = useMemo(() => 
    channels.filter(c => c.type === 'VOICE'), 
    [channels]
  );

  // Fetch messages when channel changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChannelId) {
        setMessages([]);
        return;
      }

      try {
        setIsLoadingMessages(true);
        console.log('Fetching messages for channel:', activeChannelId);
        const data = await messageApi.getMessages(activeChannelId);
        console.log('Messages received:', data);
        
        if (data && Array.isArray(data.content)) {
          // Backend returns Page<MessageResponse>, newest first (DESC)
          // For display, we want chronological order (oldest at top)
          setMessages([...data.content].reverse());
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void fetchMessages();
  }, [activeChannelId]);

  // WebSocket integration
  const { sendMessage } = useWebSocket({
    channelId: activeChannelId,
    onMessageReceived: (newMsg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if already present in history
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    }
  });

  const handleSendMessage = (e?: React.FormEvent) => {
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
          // Default to first server if none selected
          if (servers.length > 0 && !selectedServerId) {
            setSelectedServerId(servers[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load joined servers:', error);
      }
    };

    loadJoinedServers();

    return () => {
      isMounted = false;
    };
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

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden">
      <aside className="w-[72px] bg-surface-container-lowest flex flex-col items-center py-4 gap-4 z-50">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary cursor-pointer active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div className="w-8 h-[2px] bg-surface-container-highest rounded-full"></div>

        {joinedServers.map((server) => (
          <div key={server.id} className="group relative">
            <div 
              onClick={() => setSelectedServerId(server.id)}
              className={`w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 ${
                selectedServerId === server.id 
                  ? 'bg-primary rounded-2xl text-on-primary shadow-[0_0_15px_rgba(129,236,255,0.4)]' 
                  : 'bg-surface-container-high rounded-full hover:rounded-2xl'
              }`}
            >
              {server.avatarUrl && server.avatarUrl.trim() !== "" ? (
                <img
                  className="w-full h-full object-cover"
                  alt={server.name}
                  src={server.avatarUrl}
                />
              ) : (
                <span className={`text-lg font-bold uppercase ${selectedServerId === server.id ? 'text-on-primary' : 'text-primary'}`}>
                  {server.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            {/* Active Indicator Pillar */}
            <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 bg-on-surface rounded-r-full transition-all ${
              selectedServerId === server.id ? 'h-8' : 'h-2 group-hover:h-5'
            }`}></div>
            
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 min-w-52 max-w-64 rounded-xl border border-outline-variant/30 bg-surface-container-high p-3 shadow-[0_12px_28px_rgba(0,0,0,0.45)] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 z-40">
              <p className="text-sm font-bold text-on-surface truncate">{server.name || 'Untitled Server'}</p>
            </div>
          </div>
        ))}

        <div className="group relative">
          <button
            type="button"
            onClick={handleCreateServer}
            className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center hover:rounded-2xl transition-all duration-300 cursor-pointer text-primary bg-surface-bright active:scale-95"
            aria-label="Create server"
            title="Create server"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="mt-auto">
          <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center hover:rounded-2xl transition-all duration-300 cursor-pointer text-secondary active:scale-95">
            <span className="material-symbols-outlined">explore</span>
          </div>
        </div>
      </aside>

      <nav className="w-[280px] bg-surface-container-low flex flex-col shrink-0">
        <header className="h-16 px-4 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-xl shrink-0 border-b border-outline-variant/5">
          <h1 className="font-headline text-lg font-bold tracking-tight text-primary drop-shadow-[0_0_8px_rgba(129,236,255,0.4)] truncate max-w-[200px]">
            {selectedServer?.name || 'LiveBox'}
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
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer group/channel ${
                      activeChannelId === channel.id
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
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer group/voice"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg opacity-60 group-hover/voice:opacity-100">volume_up</span>
                      <span className="text-sm truncate">{channel.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Channels */}
          {channels.length === 0 && (
            <div className="px-4 py-10 text-center space-y-2">
              <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-outline/30">
                <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
              </div>
              <p className="text-xs text-outline font-medium">No channels found</p>
            </div>
          )}
        </div>

        <footer className="p-3 bg-surface-container-lowest/30 backdrop-blur-md flex items-center gap-3">
          <div className="relative">
            <img
              className="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrcQqYCdjdv2LMgywEgtJJW9i0gyIG4Mg4g6FLK5cMEHosDGQ2d1iaZ_dfiN6dntZa_IrvCj6NrUE1T2QVXgSG-MidVNKCmZWJQzptAOdJC3PteNyaCjtYhjLYCT0vH3SJYEDtJFXKQ5_8QIT-xGRdVFUOyrB5-s7NHwtptbgXYSK_LAXh7XejB4r4R0LKMuRoA7uHLiGv5JR0uqoTqtcRouaYlOrR6YbPtNFnXmdbBVwy_4fpjPqI1V1Di907P-zRW_qwK1OgKOA"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full ring-2 ring-surface shadow-[0_0_8px_#81ecff]"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">Lan Anh</p>
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
              aria-label="Open settings menu"
              title="Settings"
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
                  Xem server cua ban
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
      </nav>

      <main className="flex-1 flex flex-col bg-surface overflow-hidden">
        <header className="h-16 px-6 flex items-center justify-between shrink-0 bg-surface/60 backdrop-blur-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-medium text-outline">#</span>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {channels.find(c => c.id === activeChannelId)?.name || 'general'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-high px-4 py-1.5 rounded-full gap-2 w-64 border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg text-outline">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-outline w-full" placeholder="Search the void..." type="text" />
            </div>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">notifications</span>
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="flex items-center justify-center p-1 rounded-lg text-outline hover:text-primary hover:bg-white/5 transition-all active:scale-90"
              title="Join a Server"
            >
              <span className="material-symbols-outlined">group_add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-outline text-sm font-headline tracking-widest uppercase">Deciphering signals...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-4 max-w-2xl group">
                <img
                  className="w-10 h-10 rounded-full mt-1 border border-outline-variant/20 shadow-sm"
                  alt={msg.sender.displayName}
                  src={msg.sender.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.displayName)}&background=random`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">{msg.sender.displayName}</span>
                    <span className="text-[10px] text-outline font-headline uppercase tracking-[0.1em]">
                      {new Date(msg.createdAt).toLocaleString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true,
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="bg-surface-container-high/80 p-4 rounded-r-2xl rounded-bl-2xl text-on-surface leading-relaxed shadow-sm border border-white/5 group-hover:bg-surface-bright transition-all duration-300">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60 py-20">
              <div className="w-24 h-24 bg-surface-container-highest/50 rounded-full flex items-center justify-center mb-8 border border-outline-variant/10 shadow-xl">
                <span className="material-symbols-outlined text-5xl text-primary animate-pulse">forum</span>
              </div>
              <h3 className="text-on-surface font-black text-3xl font-headline tracking-tight mb-3">The beginning of a new cluster</h3>
              <p className="text-on-surface-variant max-w-sm leading-relaxed">
                Welcome to the <span className="text-primary font-bold">#{channels.find(c => c.id === activeChannelId)?.name || 'channel'}</span> channel. 
                Start the conversation and ignite the void.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-6 shrink-0">
          <form 
            onSubmit={handleSendMessage}
            className="bg-surface-container-high rounded-full flex items-center p-2 pl-6 gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-outline-variant/10"
          >
            <button type="button" className="text-outline hover:text-primary transition-colors active:scale-90">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50" 
              placeholder={`Message #${channels.find(c => c.id === activeChannelId)?.name || 'channel'}`}
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 text-outline hover:text-primary transition-colors active:scale-90">
                <span className="material-symbols-outlined">mood</span>
              </button>
              <button 
                type="submit"
                disabled={!messageInput.trim()}
                className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(129,236,255,0.5)] transition-all active:scale-90 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </form>
        </footer>
      </main>

      <aside className="w-60 bg-surface-container-low shrink-0 hidden lg:flex flex-col">
        <div className="p-6 overflow-y-auto">
          <section className="mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline mb-4">Online - 3</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover grayscale-0 group-hover:ring-2 ring-primary ring-offset-2 ring-offset-surface transition-all"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHl6MX6Ch2pc6wyq6zAHmL-BAE7FX_-pwqBcXoxNpprHpicgpDKmvcjkYKThtS1r5L9Q2HIYWegr1Fx4jGtcc_f6M4wSnZ6da693WXr13eh2BEyck2tIqxpYrFu7QaaxAoZRSiogkcmQOZMlYWfRMYMOsnedcxJIEfiAxT10su3_PfnWBnkR7dPaKnemyL47KsRAK_Fp6oYbSBdFrDTCYfbW4YcqwunJLNWkJ8x_lIDhsWxDSCaerfpdnhMZ3Ta-Xetifo64i_Vaw"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Marcus</p>
                  <p className="text-[10px] text-outline truncate uppercase tracking-tighter">Syncing Neurons</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover group-hover:ring-2 ring-primary ring-offset-2 ring-offset-surface transition-all"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA38dhJuHOLhaM8nXrP8YXnnft1uYkf7ijPjOfC5oYdFVMyowMuFJ19jf_cUMnNqy--_p_iC1f72oaw00_SqeOEFxIh-Ct0YscxUNNWPus5z9yKCWLGDjLBWCkuFy4f85GiDwb_wpT7fDmnvDxkcM5HgXNpiVWLuc5bpU-Qxk6HGl_bgKYxTJjnPbNkg7IjV5V5ktLw1E8yoMMylre45vBUGa9sGOWIyLgJcPDq-kwUeCDT569mIoKH-gdRroiWGc51vEkqMGxWbc"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary truncate group-hover:text-primary transition-colors">Sarah</p>
                  <p className="text-[10px] text-outline truncate uppercase tracking-tighter">Designing Reality</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer opacity-80">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt="User avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGbR60etsfgpCoPlidAN9R2zgfewaBsDKRwkg6eyTY0vW5QZaN9FCNLwIwj1ntJhfrF1O3CFI7eOOyEOzCt0hxtGXwTKjNMqV_NpdMg6dT1wow_Ps2WrLV09_1GxV0gPsmMBUOqzIIpCDRNMGV9ytn7pn1F5VKg7ADhHLSTeBMMwso7LWsdeqBFHrqgokJSc93J633DMmJCtUWlUhEcoPkTRo0_sbZ8bLTKtWodM09GKxHtZHPxXR_kECWhMQdHUCi1C8NilYL9Rw"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">Lan Anh</p>
                  <p className="text-[10px] text-outline truncate uppercase tracking-tighter">Active Hub</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline mb-4">Offline - 14</h3>
            <div className="space-y-4 opacity-50">
              <div className="flex items-center gap-3 grayscale cursor-not-allowed">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3yc72t0U-dP0r0h2YqONV_DK5B__OMsFVsULoFuxX4VdEA8dLnXftajoqbjEAhcqPkCwMJLkpgp337SscRRUlq0ZtMUFXPrb7fUFjCFP2fw2cn7n4huk53cPdqek9H6zzPwbG78lhMEk-EQ7lhq8gfgJ0mbecR4UTIMgmQ7KPTHp0eXnV3sxZrzfVrM1YCjBo3gVqVHIhIz3ICpdjx-wdPQvGEtSXtL8soEO0ivb44jCacVjhgwW5qi79GNFdeEgXDI-aP1faCcw"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-outline rounded-full ring-2 ring-surface-container-low"></div>
                </div>
                <p className="text-sm font-semibold text-outline">Dave_V</p>
              </div>

              <div className="flex items-center gap-3 grayscale cursor-not-allowed">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmHUpoTjltGXevM83IS6oKgmzvJJ9VF2NVn-kRThVgl_Hoq9ZP-COoHOV2PXnlrpcN-n51_3M2EPkLhzbV9RXqPFkyNGsCwgUDZSQeIQJYnysPiusePjH3DDFW6eN_fuSCF6kls0CcbgN9XKmXM866IhX6SqmXMHV5s3UPK9EC69zyqOtdcqUq06gUyKcdDApeK50IKTbbckOhuRtPtY5dPGmbddslrWB-Po51UrukzjO8YXaPC0YiQnuG2GzJFGmauCY0KZnv4eo"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-outline rounded-full ring-2 ring-surface-container-low"></div>
                </div>
                <p className="text-sm font-semibold text-outline">Elena_M</p>
              </div>
            </div>
          </section>
        </div>
      </aside>
      <JoinServerModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        onSuccess={() => {
          // Optionally reload servers or show success
          window.location.reload(); 
        }}
      />
    </div>
  );
};
