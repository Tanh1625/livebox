import axiosClient from '../../../config/axiosClient';
import { UserProfile, UserProfileUpdateRequest, ChangePasswordRequest } from '../types';

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await axiosClient.get<any>('/api/v1/users/me');
    return res.data;
  },

  updateProfile: async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
    const formData = new FormData();
    if (data.displayName) formData.append('displayName', data.displayName);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.bio !== undefined) formData.append('bio', data.bio);

    const res = await axiosClient.patch<any>('/api/v1/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosClient.patch('/api/v1/users/me/password', data);
  },
};
