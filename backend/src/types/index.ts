export type UserRole = 'customer' | 'doodhwala' | 'admin';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
