import axiosClient from '../../../config/axiosClient';
import { InvitePreviewResponse, InviteResponse } from '../types';

export const inviteApi = {
  /**
   * LB-202: Tạo invite link (Owner only)
   */
  generateInvite: async (serverId: string): Promise<InviteResponse> => {
    const res = await axiosClient.post<unknown, { data: InviteResponse }>(
      `/api/v1/servers/${serverId}/invites`
    );
    return res.data;
  },

  /**
   * Preview invite link info
   */
  previewInvite: async (code: string): Promise<InvitePreviewResponse> => {
    const res = await axiosClient.get<unknown, { data: InvitePreviewResponse }>(
      `/api/v1/invites/${code}`
    );
    return res.data;
  },

  /**
   * Join a server using invite code
   */
  joinServer: async (code: string): Promise<void> => {
    await axiosClient.post(`/api/v1/invites/${code}/join`);
  }
};
