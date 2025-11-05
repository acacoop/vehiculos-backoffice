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
