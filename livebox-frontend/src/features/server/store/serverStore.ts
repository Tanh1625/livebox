import { create } from 'zustand';
import type { ServerResponse } from '../types/server.types';

interface ServerState {
  servers: ServerResponse[];
  addServer: (server: ServerResponse) => void;
  setServers: (servers: ServerResponse[]) => void;
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),
  setServers: (servers) => set({ servers }),
}));
