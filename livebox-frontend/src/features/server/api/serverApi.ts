import axiosClient from '../../../config/axiosClient';
import { MemberStatusResponse, ServerCreateRequest, ServerResponse, ServerUpdateRequest } from '../types';

const normalizeServerList = (payload: unknown): ServerResponse[] => {
  if (Array.isArray(payload)) {
    return payload as ServerResponse[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const maybeApiResponse = payload as { data?: unknown };
  if (Array.isArray(maybeApiResponse.data)) {
    return maybeApiResponse.data as ServerResponse[];
  }

  if (maybeApiResponse.data && typeof maybeApiResponse.data === 'object') {
    const maybeDataObject = maybeApiResponse.data as { content?: unknown; id?: string };

    if (Array.isArray(maybeDataObject.content)) {
      return maybeDataObject.content as ServerResponse[];
    }

    if (maybeDataObject.id) {
      return [maybeDataObject as ServerResponse];
    }
  }

  const maybeSingleServer = payload as { id?: string };
  if (maybeSingleServer.id) {
    return [maybeSingleServer as ServerResponse];
  }

  return [];
};

const normalizeSingleServer = (payload: unknown): ServerResponse | null => {
  const servers = normalizeServerList(payload);
  return servers[0] ?? null;
};

export const serverApi = {
  createServer: async (data: ServerCreateRequest): Promise<ServerResponse> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }
    const res = await axiosClient.post<unknown, { data: ServerResponse }>('/api/v1/servers', formData);
    return res.data;
  },

  getMyServers: async (): Promise<ServerResponse[]> => {
    const res = await axiosClient.get('/api/v1/servers/me');
    return normalizeServerList(res);
  },

  getMyOwnedServers: async (): Promise<ServerResponse[]> => {
    const res = await axiosClient.get('/api/v1/servers/owned');
    return normalizeServerList(res);
  },

  getServerById: async (id: string): Promise<ServerResponse> => {
    const res = await axiosClient.get(`/api/v1/servers/${id}`);
    const server = normalizeSingleServer(res);

    if (!server) {
      throw new Error('Server response is empty.');
    }

    return server;
  },

  updateServer: async (id: string, data: ServerUpdateRequest): Promise<ServerResponse> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.avatar) formData.append('avatar', data.avatar);
    
    const res = await axiosClient.patch(`/api/v1/servers/${id}`, formData);
    const server = normalizeSingleServer(res);

    if (!server) {
      throw new Error('Server response is empty.');
    }

    return server;
  },

  deleteServer: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/servers/${id}`);
  },

  getServerMembers: async (serverId: string): Promise<MemberStatusResponse[]> => {
    const res = await axiosClient.get(`/api/v1/servers/${serverId}/members`);
    return (res as any).data || [];
  }
};
