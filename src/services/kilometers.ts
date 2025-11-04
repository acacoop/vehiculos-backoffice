import { API_CONFIG } from "../common/constants";
import { getAccessToken } from "../common/auth";
import { getAllUsers } from "./users";
import type {
  VehicleKilometersLog,
  CreateKilometersLogRequest,
  ApiResponse,
  ApiError,
  GetKilometersParams,
} from "../types/kilometer";

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Custom error class for API errors
 */
export class KilometersApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type?: string,
    public title?: string
  ) {
    super(message);
    this.name = "KilometersApiError";
  }
}

/**
 * Utility function to handle API responses and errors
 */
const handleApiResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  // Try to parse JSON even if content-type is not strictly application/json
  let data: any = null;
  try {
    data = await response.json();
  } catch (err) {
    // If parsing fails, throw a descriptive error
    throw new KilometersApiError(
      `Invalid response format from server: ${response.statusText}`,
      response.status
    );
  }

  if (!response.ok) {
    // Try to map known error shapes
    const apiError = (data && (data as ApiError)) || null;
    const message =
      apiError?.message || data?.detail || data?.error || response.statusText;
    const statusCode = apiError?.statusCode || data?.status || response.status;
    throw new KilometersApiError(
      message || "Unknown API error",
      statusCode,
      apiError?.type,
      apiError?.title
    );
  }

  return data as ApiResponse<T>;
};

/**
 * Vehicle Kilometers Service
 * Handles all API operations related to vehicle kilometers logging
 */
export class VehicleKilometersService {
  /**
   * Get all kilometers logs for a specific vehicle
   * @param vehicleId - UUID of the vehicle
   * @param params - Optional query parameters
   * @returns Promise with array of kilometers logs
   */
  static async getVehicleKilometers(
    vehicleId: string,
    params?: GetKilometersParams
  ): Promise<VehicleKilometersLog[]> {
    // Client-side validation
    if (!vehicleId) {
      throw new KilometersApiError("Vehicle ID is required", 400);
    }

    try {
      // Build query string if params provided
      const queryString = params
        ? "?" +
          new URLSearchParams(
            Object.entries(params)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => [key, String(value)])
          ).toString()
        : "";

      const token = await getAccessToken().catch(() => undefined);

      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/kilometers${queryString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      // Parse JSON safely (backend might return either an array or a wrapper { status, data })
      const parsed = await (async () => {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          // try to read text for debugging
          const text = await response.text().catch(() => "");
          throw new KilometersApiError(
            `Invalid response format from server: ${text.slice(0, 200)}`,
            response.status
          );
        }
        return response.json();
      })();

      // Normalize possible shapes
      // Case A: backend returns array directly
      let logsRaw: any = [];
      if (Array.isArray(parsed)) {
        logsRaw = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.data)) {
          logsRaw = parsed.data;
        } else if (parsed.status === "success" && Array.isArray(parsed.data)) {
          logsRaw = parsed.data;
        } else if (Array.isArray(parsed.items)) {
          // alternative shape
          logsRaw = parsed.items;
        } else {
          // Unexpected shape
          throw new KilometersApiError(
            "Unexpected response shape from kilometers endpoint",
            response.status
          );
        }
      } else {
        throw new KilometersApiError(
          "Unexpected response from server",
          response.status
        );
      }

      // Map/normalize each item to VehicleKilometersLog (keep dates as ISO strings or Date)
      const normalized: VehicleKilometersLog[] = logsRaw.map((log: any) => ({
        id: log.id,
        vehicleId: log.vehicleId || log.vehicle_id,
        userId: log.userId || log.user_id,
        date: log.date,
        kilometers: log.kilometers,
        createdAt: log.createdAt || log.created_at,
      }));

      return normalized;
    } catch (error) {
      if (error instanceof KilometersApiError) {
        throw error;
      }

      // Network or other errors
      console.error("Network error in getVehicleKilometers:", error);
      throw new KilometersApiError(
        "Failed to fetch vehicle kilometers. Please check your connection.",
        0
      );
    }
  }

  /**
   * Create a new kilometers log for a vehicle
   * @param vehicleId - UUID of the vehicle
   * @param logData - Data for the new kilometers log
   * @returns Promise with created kilometers log
   */
  static async createKilometersLog(
    vehicleId: string,
    logData: CreateKilometersLogRequest
  ): Promise<VehicleKilometersLog> {
    // Client-side validations
    if (!vehicleId) {
      throw new KilometersApiError("Vehicle ID is required", 400);
    }

    if (!logData.userId) {
      throw new KilometersApiError("User ID is required", 400);
    }

    if (!logData.date) {
      throw new KilometersApiError("Date is required", 400);
    }

    if (logData.kilometers < 0) {
      throw new KilometersApiError(
        "Kilometers must be a non-negative number",
        400
      );
    }

    if (!Number.isInteger(logData.kilometers)) {
      throw new KilometersApiError("Kilometers must be an integer", 400);
    }

    try {
      // Ensure date is in ISO string format
      const requestData: CreateKilometersLogRequest = {
        ...logData,
        date:
          logData.date instanceof Date
            ? logData.date.toISOString()
            : logData.date,
      };

      const token = await getAccessToken().catch(() => undefined);

      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/kilometers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(requestData),
        }
      );

      const apiResponse = await handleApiResponse<VehicleKilometersLog>(
        response
      );

      // Transform date strings to Date objects
      const transformedData: VehicleKilometersLog = {
        ...apiResponse.data,
        date: new Date(apiResponse.data.date),
        createdAt: apiResponse.data.createdAt
          ? new Date(apiResponse.data.createdAt)
          : undefined,
      };

      return transformedData;
    } catch (error) {
      if (error instanceof KilometersApiError) {
        throw error;
      }

      // Network or other errors
      console.error("Network error in createKilometersLog:", error);
      throw new KilometersApiError(
        "Failed to create kilometers log. Please check your connection.",
        0
      );
    }
  }

  /**
   * Get the latest kilometers reading for a vehicle
   * @param vehicleId - UUID of the vehicle
   * @returns Promise with the latest kilometers log or null if none found
   */
  static async getLatestKilometers(
    vehicleId: string
  ): Promise<VehicleKilometersLog | null> {
    try {
      const logs = await this.getVehicleKilometers(vehicleId);

      if (logs.length === 0) {
        return null;
      }

      // Return the log with the most recent date
      return logs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
    } catch (error) {
      // Re-throw the error to maintain error handling consistency
      throw error;
    }
  }

  /**
   * Validate if new kilometers reading is consistent with existing logs
   * @param vehicleId - UUID of the vehicle
   * @param newKilometers - New kilometers reading
   * @param newDate - Date of new reading
   * @returns Promise with validation result
   */
  static async validateKilometersConsistency(
    vehicleId: string,
    newKilometers: number,
    newDate: Date
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      const logs = await this.getVehicleKilometers(vehicleId);

      if (logs.length === 0) {
        return { valid: true };
      }

      // Check against previous logs
      const previousLogs = logs.filter((log) => new Date(log.date) < newDate);
      const futureLogs = logs.filter((log) => new Date(log.date) > newDate);

      // Check if kilometers are less than any previous reading
      const maxPrevious = Math.max(
        ...previousLogs.map((log) => log.kilometers)
      );
      if (previousLogs.length > 0 && newKilometers < maxPrevious) {
        return {
          valid: false,
          message: `New kilometers (${newKilometers}) cannot be less than previous maximum (${maxPrevious})`,
        };
      }

      // Check if kilometers are more than any future reading
      const minFuture = Math.min(...futureLogs.map((log) => log.kilometers));
      if (futureLogs.length > 0 && newKilometers > minFuture) {
        return {
          valid: false,
          message: `New kilometers (${newKilometers}) cannot be more than future minimum (${minFuture})`,
        };
      }

      return { valid: true };
    } catch (error) {
      console.warn("Could not validate kilometers consistency:", error);
      // Return valid: true if we can't validate to avoid blocking the user
      return { valid: true };
    }
  }

  /**
   * Get vehicle kilometers formatted for table display
   * @param vehicleId - UUID of the vehicle
   * @param paginationParams - Pagination parameters
   * @param options - Optional search parameters
   * @returns Promise with formatted kilometers data for table
   */
  static async getVehicleKilometersForTable(
    vehicleId: string,
    paginationParams: { page?: number; limit?: number; pageSize?: number },
    options?: { search?: string }
  ): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      date: string;
      kilometers: number;
      notes?: string;
      createdBy?: string;
    }>;
    message: string;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      pages: number;
    };
    error?: any;
  }> {
    try {
      const { page = 1, limit = 20, pageSize = limit } = paginationParams;

      // Get all kilometers logs from the API
      const logs = await this.getVehicleKilometers(vehicleId);

      // Sort by date (most recent first)
      let sortedLogs = logs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Apply search filter if provided
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        sortedLogs = sortedLogs.filter((log) => {
          const dateStr = new Date(log.date).toLocaleDateString();
          const kmStr = log.kilometers.toString();
          return dateStr.includes(searchLower) || kmStr.includes(searchLower);
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLogs = sortedLogs.slice(startIndex, endIndex);

      // Format data for table
      // Build userId -> display name map (single call to users service)
      let userMap: Record<string, string> = {};
      try {
        const usersResp = await getAllUsers();
        if (usersResp.success && Array.isArray(usersResp.data)) {
          userMap = usersResp.data.reduce((acc, u) => {
            if (u && u.id) acc[u.id] = `${u.firstName} ${u.lastName}`.trim();
            return acc;
          }, {} as Record<string, string>);
        }
      } catch (err) {
        // ignore and fallback to id
      }

      const formattedData = paginatedLogs.map((log) => ({
        id: log.id || `${log.vehicleId}-${new Date(log.date).getTime()}`,
        date: new Date(log.date).toISOString(),
        kilometers: log.kilometers,
        notes: "Registro de kilometraje",
        createdBy: userMap[log.userId] || log.userId,
      }));

      return {
        success: true,
        data: formattedData,
        message: "Datos de kilometraje obtenidos correctamente",
        pagination: {
          page,
          pageSize,
          total: sortedLogs.length,
          pages: Math.ceil(sortedLogs.length / pageSize),
        },
      };
    } catch (error) {
      console.error("Error in getVehicleKilometersForTable:", error);
      return {
        success: false,
        data: [],
        message: `Error al obtener historial de kilometraje: ${
          (error as Error)?.message
        }`,
        error: error as any,
      };
    }
  }
}
export default VehicleKilometersService;
