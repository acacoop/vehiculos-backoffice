/**
 * Gets a nested value from an object using dot-separated path or bracket notation
 * Supports: "model.name", "items[0].name", "items.0.name"
 * @param obj - The object to get the value from
 * @param path - Path to the value (dot-separated or bracket notation)
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined;

  // Handle bracket notation like "items[0].name" -> ["items", "0", "name"]
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const keys = normalizedPath.split(".").filter((key) => key !== "");

  let current: unknown = obj;

  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }

    // Handle array indices
    if (Array.isArray(current) && /^\d+$/.test(key)) {
      const index = parseInt(key, 10);
      current = current[index];
    } else {
      current = (current as Record<string, unknown>)[key];
    }
  }

  return current;
}

/**
 * Gets a nested string value from an object, with fallback to empty string
 * @param obj - The object to get the value from
 * @param path - Path to the value
 * @returns String representation of the value, or empty string if not found
 */
export function getNestedString(obj: unknown, path: string): string {
  const value = getNestedValue(obj, path);
  return value == null ? "" : String(value);
}

/**
 * Calculate the status of a maintenance checklist
 * @param checklist - The maintenance checklist to evaluate
 * @returns Object with status label, detailed label (with counts if needed), and color
 */
import { CHECKLIST_STATUS } from "./constants";
import { COLORS } from "./colors";
import type { MaintenanceChecklist } from "../types/maintenanceChecklist";

export function getChecklistStatus(checklist: MaintenanceChecklist) {
  // If filled, check for failures
  if (checklist.filledAt) {
    const hasFailures = checklist.hasFailedItems;
    if (hasFailures) {
      const passed = Number(checklist.passedCount || 0);
      const total = Number(checklist.itemCount || 0);
      return {
        status: CHECKLIST_STATUS.WITH_FAILURES,
        label: `${CHECKLIST_STATUS.WITH_FAILURES} (${passed}/${total})`,
        color: COLORS.error,
      };
    }
    return {
      status: CHECKLIST_STATUS.APPROVED,
      label: CHECKLIST_STATUS.APPROVED,
      color: COLORS.success,
    };
  }

  // Not filled - check if overdue
  const currentDate = new Date();
  const intendedDate = new Date(checklist.intendedDeliveryDate);
  if (currentDate > intendedDate) {
    return {
      status: CHECKLIST_STATUS.OVERDUE,
      label: CHECKLIST_STATUS.OVERDUE,
      color: COLORS.error,
    };
  }

  // Pending
  return {
    status: CHECKLIST_STATUS.PENDING,
    label: CHECKLIST_STATUS.PENDING,
    color: COLORS.warning,
  };
}
