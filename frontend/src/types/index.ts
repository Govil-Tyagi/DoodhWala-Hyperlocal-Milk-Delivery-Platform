export type UserRole = 'customer' | 'doodhwala' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  address?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Schedule {
  _id: string;
  doodhwalaId: User | string;
  date: string;
  arrivalTime: string;
  availableQuantity: number;
  pricePerLitre: number;
  isActive: boolean;
}

export interface Order {
  _id: string;
  customerId: User | string;
  doodhwalaId: User | string;
  scheduleId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  date: string;
  note?: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  customerId: string;
  doodhwalaId: User | string;
  dailyQuantity: number;
  pricePerLitre: number;
  startDate: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
