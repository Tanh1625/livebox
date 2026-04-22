export interface ServerCreateRequest {
  name: string;
  avatarUrl?: string; // Optional
  ownerId: string;    // UUID
}

export interface ServerResponse {
  id: string;         // UUID
  name: string;
  avatarUrl: string | null;
  ownerId: string;    // UUID
  createdAt: string;  // Instant
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

// Map from form input data & context to ServerCreateRequest
export const mapToServerCreateRequest = (
  name: string,
  ownerId: string,
  avatarUrl?: string
): ServerCreateRequest => {
  return {
    name: name.trim(),
    ownerId,
    avatarUrl,
  };
};

// Map from raw API response to typed entity (defense against missing fields)
export const mapToServerResponse = (raw: any): ServerResponse => {
  return {
    id: raw.id,
    name: raw.name,
    avatarUrl: raw.avatarUrl || null,
    ownerId: raw.ownerId,
    createdAt: raw.createdAt,
  };
};
