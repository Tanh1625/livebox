import axiosClient from '../../../config/axiosClient';
import { ServerCreateRequest, ServerResponse } from '../types';

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

export const serverApi = {
  createServer: async (data: ServerCreateRequest): Promise<ServerResponse> => {
    const res = await axiosClient.post<unknown, { data: ServerResponse }>('/api/v1/servers', data);
    return res.data;
  },

  getMyServers: async (): Promise<ServerResponse[]> => {
    const res = await axiosClient.get('/api/v1/servers/me');
    return normalizeServerList(res);
  }
};
