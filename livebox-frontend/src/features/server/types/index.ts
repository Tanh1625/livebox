export interface ServerResponse {
  id: string;
  name: string;
  avatarUrl: string | null;
  ownerId: string;
  createdAt: string;
}

export interface ServerCreateRequest {
  name: string;
  avatarUrl?: string;
}

export interface ServerUpdateRequest {
  name?: string;
  avatarUrl?: string;
}

export interface InviteResponse {
  id: string;
  code: string;
  inviteUrl: string;
  expiresAt: string | null;
  serverId: string;
}

export interface InvitePreviewResponse {
  code: string;
  serverId: string;
  serverName: string;
  serverAvatarUrl: string | null;
  memberCount: number;
  expiresAt: string | null;
  alreadyMember: boolean | null;
}
