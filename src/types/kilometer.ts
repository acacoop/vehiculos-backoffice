// Types for Vehicle Kilometers API
export interface VehicleKilometersLog {
  id?: string;
  vehicleId: string;
  userId: string;
  date: Date | string; // Can be Date object or ISO string
  kilometers: number;
  createdAt?: Date | string;
}

// DTO for creating new kilometers log (vehicleId comes from URL param)
export interface CreateKilometersLogRequest {
  userId: string;
  date: Date | string;
  kilometers: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

// Error response structure
export interface ApiError {
  status: "error";
  message: string;
  statusCode: number;
  type?: string;
  title?: string;
}

// Query parameters for getting kilometers (future use)
export interface GetKilometersParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
