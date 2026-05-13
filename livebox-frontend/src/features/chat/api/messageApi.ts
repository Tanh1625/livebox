import axiosClient from '../../../config/axiosClient';
import { MessageResponse, PageResponse } from '../types';

export const messageApi = {
  /**
   * SCRUM-53: GET lịch sử tin nhắn của một Channel
   */
  getMessages: async (channelId: string, page = 0, size = 50): Promise<PageResponse<MessageResponse>> => {
    const res = await axiosClient.get<any>(
      `/api/v1/channels/${channelId}/messages`,
      { params: { page, size } }
    );
    // axiosClient returns response.data (the ApiResponse object)
    return res.data;
  }
};
