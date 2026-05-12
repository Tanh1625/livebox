export interface ServerResponse {
  id: string;
  name: string;
  avatarUrl: string | null;
  ownerId: string;
  createdAt: string;
}

export interface ServerCreateRequest {
  name: string;
  avatar?: File;
}

export interface ServerUpdateRequest {
  name?: string;
  avatar?: File;
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

export interface MemberStatusResponse {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  online: boolean;
}
