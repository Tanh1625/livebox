import axiosClient from '../../../config/axiosClient';
import { LoginRequest, RegisterRequest, TokenResponse } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    // The backend wraps responses in an ApiResponse object, e.g. { data: TokenResponse, message: "...", status: 200 }
    // Our interceptor returns response.data which is the ApiResponse.
    // So we need to handle that. Wait, if the interceptor returns response.data, 
    // it returns the ApiResponse structure. Let's assume ApiResponse has a `data` field.
    const res = await axiosClient.post<any, { data: TokenResponse }>('/auth/login', data);
    return res.data;
  },
  
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await axiosClient.post<any, { data: TokenResponse }>('/auth/register', data);
    return res.data;
  }
};
