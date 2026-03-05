// Object manipulation utilities
export { getNestedValue, getNestedString } from "./utils";

// Date formatting utilities
export {
  isActive,
  formatDate,
  formatDateTime,
  formatEndDate,
  formatRelativeDate,
  parseDate,
  inputDateToAPI,
  toInputDate,
  toInputDateSafe,
  toInputTime,
  inputsToDate,
  dateToISO,
} from "./date";

// Colors and styling constants
export { COLORS } from "./colors";

// Authentication utilities
export * from "./auth";

// Application constants
export * from "./constants";

// Navigation stack utilities
export * from "./navigationStack";

// Type definitions (for backward compatibility with old app/ files)
export type {
  ServiceResponse,
  PaginationParams,
  FilterParams,
} from "../types/common";
