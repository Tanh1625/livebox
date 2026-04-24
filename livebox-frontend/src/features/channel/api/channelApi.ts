import axiosClient from '../../../config/axiosClient';
import type { ChannelCreateRequest, ChannelResponse } from '../types';

const normalizeChannelList = (payload: unknown): ChannelResponse[] => {
  if (Array.isArray(payload)) {
    return payload as ChannelResponse[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const maybeApiResponse = payload as { data?: unknown };
  if (Array.isArray(maybeApiResponse.data)) {
    return maybeApiResponse.data as ChannelResponse[];
  }

  if (maybeApiResponse.data && typeof maybeApiResponse.data === 'object') {
    const maybeDataObject = maybeApiResponse.data as { content?: unknown; id?: string };

    if (Array.isArray(maybeDataObject.content)) {
      return maybeDataObject.content as ChannelResponse[];
    }

    if (maybeDataObject.id) {
      return [maybeDataObject as ChannelResponse];
    }
  }

  const maybeSingleChannel = payload as { id?: string };
  if (maybeSingleChannel.id) {
    return [maybeSingleChannel as ChannelResponse];
  }

  return [];
};

const normalizeSingleChannel = (payload: unknown): ChannelResponse | null => {
  const channels = normalizeChannelList(payload);
  return channels[0] ?? null;
};

export const channelApi = {
  getChannels: async (serverId: string): Promise<ChannelResponse[]> => {
    const res = await axiosClient.get(`/api/v1/servers/${serverId}/channels`);
    return normalizeChannelList(res);
  },

  createChannel: async (serverId: string, data: ChannelCreateRequest): Promise<ChannelResponse> => {
    const res = await axiosClient.post(`/api/v1/servers/${serverId}/channels`, data);
    const channel = normalizeSingleChannel(res);

    if (!channel) {
      throw new Error('Channel response is empty.');
    }

    return channel;
  },

  renameChannel: async (serverId: string, channelId: string, name: string): Promise<ChannelResponse> => {
    const res = await axiosClient.patch(`/api/v1/servers/${serverId}/channels/${channelId}`, null, {
      params: { name }
    });
    const channel = normalizeSingleChannel(res);

    if (!channel) {
      throw new Error('Channel response is empty.');
    }

    return channel;
  },

  deleteChannel: async (serverId: string, channelId: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/servers/${serverId}/channels/${channelId}`);
  }
};