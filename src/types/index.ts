export interface User {
  id: string;
  client_id?: number;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  mobile?: string;
  city?: string;
  state?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  health_condition?: string;
  beauty_goal?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HealthReport {
  _id: string;
  report_id: string;
  client_id: number;
  userId: string | { _id: string; name: string; email: string; client_id?: number };
  report_date: string;
  hemoglobin: number;
  vitamin_d: number;
  cholesterol: number;
  blood_sugar: number;
  creatinine: number;
  urine_protein: string;
  bmi: number;
  doctor_notes?: string;
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
  client_id?: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  mobile?: string;
  city?: string;
  state?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  health_condition?: string;
  beauty_goal?: string;
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
  alreadyExistsCount?: number;
  clientIdConflictCount?: number;
  errors: { row: number; email: string; message: string; type?: string; client_id?: number }[];
}

export interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  recentReports: HealthReport[];
}
