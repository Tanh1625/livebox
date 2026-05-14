import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelApi } from '../../channel/api/channelApi';
import { serverApi } from '../api/serverApi';
import { ChannelResponse, ChannelType } from '../../channel/types';
import { ServerResponse, ServerUpdateRequest } from '../types';
import InviteFriendsModal from './InviteFriendsModal';

type PopupVariant = 'success' | 'error';

interface PopupState {
  title: string;
  message: string;
  variant: PopupVariant;
}

type ChannelFormType = ChannelType;

const getBackendPopupCopy = (error: unknown, fallbackMessage: string) => {
  const maybeError = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        data?: unknown;
      };
    };
  };

  const status = maybeError.response?.status;
  const responseBody = maybeError.response?.data;

  let message = responseBody?.message || fallbackMessage;

  if (status === 400 && responseBody?.data && typeof responseBody.data === 'object' && !Array.isArray(responseBody.data)) {
    const validationMessages = Object.values(responseBody.data as Record<string, unknown>).filter(
      (value): value is string => typeof value === 'string'
    );

    if (validationMessages.length > 0) {
      message = validationMessages.join('\n');
    }
  }

  const titleByStatus: Record<number, string> = {
    400: 'Bad request',
    403: 'Permission denied',
    404: 'Server not found',
    409: 'Data conflict',
    410: 'Data expired',
    500: 'System error occurred'
  };

  return {
    title: (status && titleByStatus[status]) || 'An error occurred',
    message
  };
};

export const OwnedServersScreen: React.FC = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState<ServerResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingServerId, setLoadingServerId] = useState<string | null>(null);
  const [activeServer, setActiveServer] = useState<ServerResponse | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [channelsServer, setChannelsServer] = useState<ServerResponse | null>(null);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelFormType>('TEXT');
  const [isChannelSaving, setIsChannelSaving] = useState(false);
  const [channelEditId, setChannelEditId] = useState<string | null>(null);
  const [channelEditName, setChannelEditName] = useState('');
  const [isChannelRenameOpen, setIsChannelRenameOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteServer, setInviteServer] = useState<ServerResponse | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await serverApi.getMyOwnedServers();
        setServers(data);
      } catch (fetchError: unknown) {
        const popupCopy = getBackendPopupCopy(fetchError, 'Failed to load server list. Please try again.');
        setError(popupCopy.message);
        setPopup({
          title: popupCopy.title,
          message: popupCopy.message,
          variant: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchServers();
  }, []);

  useEffect(() => {
    if (popup && popup.variant === 'success') {
      const timer = setTimeout(() => {
        setPopup(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openEditServer = async (serverId: string) => {
    try {
      setLoadingServerId(serverId);
      const server = await serverApi.getServerById(serverId);
      setActiveServer(server);
      setEditName(server.name ?? '');
      setEditAvatarPreview(server.avatarUrl ?? '');
      setEditAvatarFile(null);
      setIsEditOpen(true);
    } catch (fetchError: unknown) {
      const popupCopy = getBackendPopupCopy(fetchError, 'Failed to open server edit form. Please try again.');
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setLoadingServerId(null);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setActiveServer(null);
    setEditName('');
    setEditAvatarPreview('');
    setEditAvatarFile(null);
  };

  const handleDeleteServer = async (serverId: string, serverName: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete server "${serverName}"? This action cannot be undone!`);
    if (!isConfirmed) return;

    try {
      setIsSaving(true);
      await serverApi.deleteServer(serverId);
      setServers((current) => current.filter((s) => s.id !== serverId));
      setPopup({
        title: 'Server deleted',
        message: `Server "${serverName}" has been deleted.`,
        variant: 'success'
      });
      if (activeServer?.id === serverId) {
        closeEditModal();
      }
    } catch (deleteError: unknown) {
      const popupCopy = getBackendPopupCopy(deleteError, 'Failed to delete server. Please try again.');
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openInvite = useCallback((server: ServerResponse) => {
    setInviteServer(server);
    setIsInviteOpen(true);
  }, []);

  const closeInviteModal = useCallback(() => {
    setIsInviteOpen(false);
    setInviteServer(null);
  }, []);

  const closeChannelsModal = () => {
    setIsChannelsOpen(false);
    setChannelsServer(null);
    setChannels([]);
    setChannelsError(null);
    setChannelName('');
    setChannelType('TEXT');
    setChannelEditId(null);
    setChannelEditName('');
    setIsChannelRenameOpen(false);
    setIsChannelSaving(false);
    setChannelsLoading(false);
  };

  const loadChannels = async (serverId: string) => {
    try {
      setChannelsLoading(true);
      setChannelsError(null);
      const data = await channelApi.getChannels(serverId);
      setChannels(data);
    } catch (channelError: unknown) {
      const popupCopy = getBackendPopupCopy(channelError, 'Failed to load channels. Please try again.');
      setChannelsError(popupCopy.message);
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setChannelsLoading(false);
    }
  };

  const openChannels = async (server: ServerResponse) => {
    setChannelsServer(server);
    setIsChannelsOpen(true);
    setChannelName('');
    setChannelType('TEXT');
    setChannelEditId(null);
    setChannelEditName('');
    setIsChannelRenameOpen(false);
    await loadChannels(server.id);
  };

  const openRenameChannel = (channel: ChannelResponse) => {
    setChannelEditId(channel.id);
    setChannelEditName(channel.name);
    setIsChannelRenameOpen(true);
  };

  const closeRenameChannel = () => {
    setChannelEditId(null);
    setChannelEditName('');
    setIsChannelRenameOpen(false);
  };

  const handleCreateChannel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!channelsServer) {
      return;
    }

    const trimmedName = channelName.trim();
    if (!trimmedName) {
      setPopup({
        title: 'Invalid channel name',
        message: 'Please enter a channel name before creating.',
        variant: 'error'
      });
      return;
    }

    try {
      setIsChannelSaving(true);
      const createdChannel = await channelApi.createChannel(channelsServer.id, {
        name: trimmedName,
        type: channelType
      });

      setChannels((current) => [...current, createdChannel]);
      setPopup({
        title: 'Channel created',
        message: `Channel created "${createdChannel.name}" for server ${channelsServer.name || channelsServer.id}.`,
        variant: 'success'
      });
      setChannelName('');
      setChannelType('TEXT');
    } catch (createError: unknown) {
      const popupCopy = getBackendPopupCopy(createError, 'Failed to create channel. Please try again.');
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setIsChannelSaving(false);
    }
  };

  const handleRenameChannel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!channelsServer || !channelEditId) {
      return;
    }

    const trimmedName = channelEditName.trim();
    if (!trimmedName) {
      setPopup({
        title: 'Invalid channel name',
        message: 'Please enter a new channel name before saving.',
        variant: 'error'
      });
      return;
    }

    try {
      setIsChannelSaving(true);
      const updatedChannel = await channelApi.renameChannel(channelsServer.id, channelEditId, trimmedName);
      setChannels((current) => current.map((channel) => (channel.id === updatedChannel.id ? updatedChannel : channel)));
      setPopup({
        title: 'Channel updated',
        message: `Renamed channel to "${updatedChannel.name}".`,
        variant: 'success'
      });
      closeRenameChannel();
    } catch (renameError: unknown) {
      const popupCopy = getBackendPopupCopy(renameError, 'Failed to rename channel. Please try again.');
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setIsChannelSaving(false);
    }
  };

  const handleDeleteChannel = async (channel: ChannelResponse) => {
    if (!channelsServer) {
      return;
    }

    const isConfirmed = window.confirm(`Delete channel "${channel.name}"?`);
    if (!isConfirmed) {
      return;
    }

    try {
      setIsChannelSaving(true);
      await channelApi.deleteChannel(channelsServer.id, channel.id);
      setChannels((current) => current.filter((item) => item.id !== channel.id));
      setPopup({
        title: 'Channel deleted',
        message: `Channel "${channel.name}" has been deleted.`,
        variant: 'success'
      });
    } catch (deleteError: unknown) {
      const popupCopy = getBackendPopupCopy(deleteError, 'Failed to delete channel. Please try again.');
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setIsChannelSaving(false);
    }
  };

  const handleUpdateServer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeServer) {
      return;
    }

    try {
      setIsSaving(true);

      const payload: ServerUpdateRequest = {};
      const trimmedName = editName.trim();

      if (trimmedName) {
        payload.name = trimmedName;
      }

      if (editAvatarFile) {
        payload.avatar = editAvatarFile;
      }

      const updatedServer = await serverApi.updateServer(activeServer.id, payload);

      setServers((current) => current.map((server) => (server.id === updatedServer.id ? updatedServer : server)));
      setPopup({
        title: 'Update successful',
        message: 'Server information updated successfully.',
        variant: 'success'
      });
      closeEditModal();
    } catch (updateError: unknown) {
      const popupCopy = getBackendPopupCopy(updateError, 'Failed to update server. Please try again.');
      setPopup({
        title: popupCopy.title,
        message: popupCopy.message,
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServers = servers.filter((server) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      (server.name || '').toLowerCase().includes(query)
      || server.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,229,255,0.1)]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary p-[2px]">
              <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">dns</span>
              </div>
            </div>
            <h1 className="font-display tracking-tight font-bold text-2xl text-primary">Live Box</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/servers/create')}
              className="px-4 py-2 rounded-full text-sm bg-primary text-on-primary font-semibold hover:opacity-90 transition-colors"
            >
              Create server
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/main')}
              className="text-primary active:scale-95 duration-200 hover:bg-primary/10 transition-colors p-2 rounded-full"
              aria-label="Back"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-b from-primary/10 to-transparent h-px w-full"></div>
      </header>

      <main className="pt-24 pb-28 px-6 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 focus:bg-surface-bright transition-all outline-none font-medium"
              placeholder="Filter servers..."
              type="text"
            />
          </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <h2 className="font-headline text-2xl font-extrabold tracking-tight">Active Nodes</h2>
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">{filteredServers.length} Online</span>
        </div>

        {isLoading && (
          <div className="rounded-2xl bg-surface-container-low p-8 border border-outline-variant/20 text-on-surface-variant">
            Loading data...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl bg-error-container/20 p-8 border border-error/40 text-error space-y-3">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-error text-on-error hover:opacity-90 transition-colors"
            >
              Reload page
            </button>
          </div>
        )}

        {!isLoading && !error && servers.length === 0 && (
          <div className="rounded-2xl bg-surface-container-low p-8 border border-outline-variant/20 text-on-surface-variant space-y-4">
            <p>You haven't created any servers yet.</p>
            <button
              type="button"
              onClick={() => navigate('/servers/create')}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-colors"
            >
              Create your first server
            </button>
          </div>
        )}

        {!isLoading && !error && servers.length > 0 && filteredServers.length === 0 && (
          <div className="rounded-2xl bg-surface-container-low p-8 border border-outline-variant/20 text-on-surface-variant">
            Server not found phu hop voi tu khoa "{searchQuery}".
          </div>
        )}

        {!isLoading && !error && filteredServers.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredServers.map((server) => {
              return (
                <div key={server.id} className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary to-secondary rounded-lg opacity-40 blur-[2px]"></div>
                  <div className="relative bg-surface-container-highest p-5 rounded-lg flex flex-col gap-4 shadow-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-low border border-primary/20 shrink-0">
                          {server.avatarUrl ? (
                            <img alt={server.name} className="w-full h-full object-cover" src={server.avatarUrl} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                              {(server.name || 'S').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline font-bold text-lg text-primary truncate">{server.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(129,236,255,1)]"></span>
                            <span className="text-xs text-on-surface-variant font-medium truncate">ID: {server.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Owner</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => void openChannels(server)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-primary font-headline font-bold transition-colors hover:bg-primary/15 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">forum</span>
                        Channels
                      </button>
                      <button
                        type="button"
                        onClick={() => void openEditServer(server.id)}
                        disabled={loadingServerId === server.id}
                        className="flex-1 min-w-0 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-headline font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-wait"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        {loadingServerId === server.id ? 'Opening...' : 'Edit server'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openInvite(server)}
                        className="w-12 h-12 flex items-center justify-center bg-surface-container-high rounded-xl text-primary hover:bg-surface-bright transition-colors"
                        title="Create invite link"
                      >
                        <span className="material-symbols-outlined">person_add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {popup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.45)] ${popup.variant === 'success' ? 'border-primary/30 bg-surface-container' : 'border-error/40 bg-surface-container'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">{popup.title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-on-surface-variant">{popup.message}</p>
              </div>
              <button
                type="button"
                onClick={closePopup}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Close popup"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closePopup}
                className={`px-4 py-2 rounded-xl transition-colors ${popup.variant === 'success' ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-error text-on-error hover:opacity-90'}`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && activeServer && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-outline-variant/20 bg-surface-container-low shadow-[0_32px_96px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Edit server</h2>
                <p className="text-sm text-on-surface-variant mt-1">Update name and avatar for {activeServer.name}.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Close edit modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={(event) => void handleUpdateServer(event)} className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)] items-start">
                <div className="space-y-3">
                  <div className="h-40 w-40 rounded-3xl border border-outline-variant/20 bg-surface-container-high overflow-hidden flex items-center justify-center relative group">
                    {editAvatarPreview ? (
                      <img src={editAvatarPreview} alt="Avatar preview" className="h-full w-full object-cover group-hover:opacity-60 transition-opacity" />
                    ) : (
                      <div className="text-center text-on-surface-variant px-4 group-hover:opacity-60 transition-opacity">
                        <span className="material-symbols-outlined text-4xl">image</span>
                        <p className="mt-2 text-sm">No avatar</p>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white backdrop-blur-sm bg-black/30">
                      <span className="material-symbols-outlined">upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <p className="text-xs text-on-surface-variant">Click the frame above to upload image (Max 5MB).</p>
                </div>

                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Server name</span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      placeholder="Enter server name"
                      className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                    />
                  </label>

                  <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-4 text-sm text-on-surface-variant">
                    Changes to the server name are applied immediately upon saving. Errors will be shown in a popup.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 w-full justify-between">
                {activeServer && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteServer(activeServer.id, activeServer.name ?? '')}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    Delete Server
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isChannelsOpen && channelsServer && (
        <div className="fixed inset-0 z-[66] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-[0_24px_64px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-extrabold tracking-tighter text-on-surface">Create Channel</h2>
                <p className="mt-1 text-sm text-on-surface-variant">For {channelsServer.name || channelsServer.id}</p>
              </div>
              <button
                type="button"
                onClick={closeChannelsModal}
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-colors duration-200 active:scale-90"
                aria-label="Close create channel modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-8 pb-8 overflow-y-auto space-y-8">
              <form onSubmit={(event) => void handleCreateChannel(event)} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">Channel Type</label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setChannelType('TEXT')}
                      className={`relative w-full text-left ${channelType === 'TEXT' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className={`absolute -inset-[1px] bg-gradient-to-r from-primary/50 to-secondary/50 rounded-lg blur transition duration-300 ${channelType === 'TEXT' ? 'opacity-50' : 'opacity-25'}`}></div>
                      <div className={`relative p-5 rounded-lg flex items-center justify-between border-none transition-all duration-200 ${channelType === 'TEXT' ? 'bg-secondary-container' : 'bg-surface-container-highest hover:bg-surface-bright'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full">
                            <span className="material-symbols-outlined text-primary">tag</span>
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-on-secondary-container">Text Channel</h3>
                            <p className="text-xs text-on-secondary-container/70 font-medium">Post images, GIFs, and stickers</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${channelType === 'TEXT' ? 'bg-primary' : 'border-2 border-outline-variant'}`}>
                          {channelType === 'TEXT' && <div className="w-2.5 h-2.5 rounded-full bg-on-primary"></div>}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannelType('VOICE')}
                      className={`relative w-full text-left ${channelType === 'VOICE' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className={`absolute -inset-[1px] bg-gradient-to-r from-primary/50 to-secondary/50 rounded-lg blur transition duration-300 ${channelType === 'VOICE' ? 'opacity-50' : 'opacity-25'}`}></div>
                      <div className={`relative bg-surface-container-highest p-5 rounded-lg flex items-center justify-between border-none transition-all duration-200 ${channelType === 'VOICE' ? 'bg-secondary-container' : 'hover:bg-surface-bright'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full">
                            <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-on-surface-variant">Voice Channel</h3>
                            <p className="text-xs text-on-surface-variant/60 font-medium">Hang out with voice, video, and screen share</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full ${channelType === 'VOICE' ? 'bg-primary' : 'border-2 border-outline-variant'}`}>
                          {channelType === 'VOICE' && <div className="w-full h-full rounded-full bg-on-primary"></div>}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">Channel Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-primary drop-shadow-[0_0_8px_rgba(129,236,255,0.6)]">tag</span>
                    </div>
                    <input
                      value={channelName}
                      onChange={(event) => setChannelName(event.target.value)}
                      className="w-full bg-surface-container-high border-none text-on-surface placeholder:text-outline py-4 pl-12 pr-6 rounded-md focus:ring-0 focus:bg-surface-bright transition-all duration-300 font-medium text-lg"
                      placeholder="new-channel"
                      type="text"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-focus-within:w-full transition-all duration-500"></div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-6 pt-2">
                  <button
                    type="button"
                    onClick={closeChannelsModal}
                    className="text-on-surface-variant font-display font-bold hover:text-on-surface transition-colors active:scale-95 duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChannelSaving}
                    className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-widest shadow-[0_8px_24px_-4px_rgba(0,227,253,0.3)] hover:shadow-[0_12px_32px_-4px_rgba(0,227,253,0.5)] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isChannelSaving ? 'Creating...' : 'Create Channel'}
                  </button>
                </div>
              </form>

              <div className="space-y-6 border-t border-outline-variant/10 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Channels</h3>
                    <p className="text-sm text-on-surface-variant">List of existing channels for this server.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadChannels(channelsServer.id)}
                    className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors"
                  >
                    Reload
                  </button>
                </div>

                {channelsLoading && <div className="rounded-2xl bg-surface-container-high p-4 text-on-surface-variant">Loading channels...</div>}

                {!channelsLoading && channelsError && (
                  <div className="rounded-2xl bg-error-container/20 p-4 border border-error/40 text-error">
                    {channelsError}
                  </div>
                )}

                {!channelsLoading && !channelsError && channels.length === 0 && (
                  <div className="rounded-2xl bg-surface-container-high p-4 text-on-surface-variant">No channels yet.</div>
                )}

                {!channelsLoading && !channelsError && channels.length > 0 && (
                  <div className="space-y-6">
                    {(['TEXT', 'VOICE'] as ChannelType[]).map((type) => {
                      const groupedChannels = channels.filter((channel) => channel.type === type);

                      if (groupedChannels.length === 0) {
                        return null;
                      }

                      return (
                        <div key={type} className="space-y-3">
                          <div className="flex items-center gap-2 px-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline">{type === 'TEXT' ? 'Text Channels' : 'Voice Channels'}</span>
                            <span className="text-[10px] text-outline-variant">({groupedChannels.length})</span>
                          </div>
                          <div className="space-y-2">
                            {groupedChannels.map((channel) => (
                              <div key={channel.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-high px-4 py-3 border border-transparent hover:border-outline-variant/30 transition-colors">
                                <div className="min-w-0 flex items-center gap-3">
                                  <span className="material-symbols-outlined text-lg text-primary">{channel.type === 'TEXT' ? 'tag' : 'volume_up'}</span>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-on-surface truncate">{channel.name}</p>
                                    <p className="text-xs text-on-surface-variant truncate">ID: {channel.id}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openRenameChannel(channel)}
                                    disabled={isChannelSaving}
                                    className="rounded-full p-2 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-wait"
                                    aria-label={`Rename ${channel.name}`}
                                  >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteChannel(channel)}
                                    disabled={isChannelSaving}
                                    className="rounded-full p-2 text-on-surface-variant hover:bg-error/15 hover:text-error transition-colors disabled:opacity-60 disabled:cursor-wait"
                                    aria-label={`Delete ${channel.name}`}
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isChannelRenameOpen && channelsServer && channelEditId && (
        <div className="fixed inset-0 z-[67] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-[0_24px_64px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-outline-variant/10">
              <div>
                <h2 className="text-2xl font-display font-extrabold tracking-tighter text-on-surface">Rename Channel</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Server: {channelsServer.name || channelsServer.id}</p>
              </div>
              <button
                type="button"
                onClick={closeRenameChannel}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-bright transition-colors"
                aria-label="Close rename channel modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={(event) => void handleRenameChannel(event)} className="p-6 space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Channel name</span>
                <input
                  type="text"
                  value={channelEditName}
                  onChange={(event) => setChannelEditName(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                  placeholder="new-channel-name"
                />
              </label>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRenameChannel}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChannelSaving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {isChannelSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteOpen && inviteServer && (
        <InviteFriendsModal
          server={inviteServer}
          onClose={closeInviteModal}
        />
      )}
    </div>
  );
};
