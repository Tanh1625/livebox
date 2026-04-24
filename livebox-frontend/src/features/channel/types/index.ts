export type ChannelType = 'TEXT' | 'VOICE';

export interface ChannelResponse {
  id: string;
  serverId: string;
  name: string;
  type: ChannelType;
  createdAt: string;
}

export interface ChannelCreateRequest {
  name: string;
  type: ChannelType;
}

export interface ChannelRenameRequest {
  name: string;
}