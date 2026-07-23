export interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ToggleUserStatusRequest {
  is_active: boolean;
}
