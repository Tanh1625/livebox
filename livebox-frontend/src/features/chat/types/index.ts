export interface MessageResponse {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface SendMessageRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
