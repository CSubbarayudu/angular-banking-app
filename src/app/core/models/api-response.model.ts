export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  totalCount?: number;
}