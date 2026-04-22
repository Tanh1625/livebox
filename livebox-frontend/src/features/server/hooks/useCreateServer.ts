import { useState } from 'react';
import { createServer as createServerApi } from '../api/serverApi';
import type { ServerCreateRequest, ServerResponse } from '../types/server.types';

export const useCreateServer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createServer = async (payload: ServerCreateRequest): Promise<ServerResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createServerApi(payload);
      return data;
    } catch (err: any) {
      const errMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo Server.';
      setError(errMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createServer, isLoading, error };
};
