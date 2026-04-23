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
