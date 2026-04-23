import axiosClient from '../../../config/axiosClient';
import { ServerCreateRequest, ServerResponse } from '../types';

export const serverApi = {
  createServer: async (data: ServerCreateRequest): Promise<ServerResponse> => {
    const res = await axiosClient.post<any, { data: ServerResponse }>('/servers', data);
    return res.data;
  }
};
