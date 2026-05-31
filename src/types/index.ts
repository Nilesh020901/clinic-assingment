export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HealthReport {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  reportDate: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  glucose: number;
  cholesterol: number;
  notes?: string;
  uploadedBy?: { name: string; email: string };
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  reportCount: number;
  latestReportDate?: string;
  createdAt: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface CsvUploadResult {
  successCount: number;
  failedCount: number;
  errors: { row: number; email: string; message: string }[];
}

export interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  recentReports: HealthReport[];
}
