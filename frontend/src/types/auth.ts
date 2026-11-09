export interface UserProfile {
  userId: string;
  username: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  farmId: string;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  farmId: string;
}

