import axiosInstance from '../../../config/axios';
import { mapToServerResponse } from '../types/server.types';
import type { ServerCreateRequest, ServerResponse, ApiResponse } from '../types/server.types';

export const createServer = async (payload: ServerCreateRequest): Promise<ServerResponse> => {
  // KHÔNG xử lý auth ở đây
  const response = await axiosInstance.post<ApiResponse<ServerResponse>>('/servers', payload);
  return mapToServerResponse(response.data.data);
};
