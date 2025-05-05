export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode?: number;
}

export interface JwtData {
  jwtData: string;
}