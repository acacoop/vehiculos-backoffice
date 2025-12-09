/**
 * Page Stack for navigation with context preservation
 *
 * Manages a stack of page contexts so that nested navigation flows
 * (e.g., Vehicle → Model → Brand) can properly return through each level
 * with all the form data preserved.
 *
 * Architecture:
 * - Page stack: tracks the return path chain (for knowing where to go back)
 * - Form data store: preserves form data by route (for restoring state when returning)
 * - Created entity: stores the last created entity for EntitySearch to consume
 */

export interface PageContext {
  /** The path to return to */
  returnPath: string;
  /** Scope/Entity type of the page that pushed this context */
  scope?: string;
  /** Timestamp for cleanup */
  timestamp: number;
}

/** Form data stored by route */
export interface StoredFormData<T = unknown> {
  /** The form data */
  data: T;
  /** Scope for validation */
  scope?: string;
  /** Timestamp for cleanup */
  timestamp: number;
}

/** Data stored when returning from a create flow - just the created entity */
export interface CreatedEntityData<T = unknown> {
  /** The created entity object */
  entity: T;
  /** The type of entity (e.g., "vehicle", "model", "brand") */
  entityType: string;
}

const STACK_KEY = "page_stack";
const FORM_DATA_KEY = "form_data_store";
const CREATED_ENTITY_KEY = "created_entity";
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get the current page stack from sessionStorage
 */
function getStack(): PageContext[] {
  try {
    const data = sessionStorage.getItem(STACK_KEY);
    if (!data) return [];

    const stack = JSON.parse(data) as PageContext[];

    // Clean up old entries
    const now = Date.now();
    return stack.filter((ctx) => now - ctx.timestamp < MAX_AGE_MS);
  } catch {
    return [];
  }
}

/**
 * Save the page stack to sessionStorage
 */
function saveStack(stack: PageContext[]): void {
  if (stack.length === 0) {
    sessionStorage.removeItem(STACK_KEY);
  } else {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack));
  }
}

/**
 * Get the form data store from sessionStorage
 */
function getFormDataStore(): Record<string, StoredFormData> {
  try {
    const data = sessionStorage.getItem(FORM_DATA_KEY);
    if (!data) return {};

    const store = JSON.parse(data) as Record<string, StoredFormData>;

    // Clean up old entries
    const now = Date.now();
    const cleaned: Record<string, StoredFormData> = {};
    for (const [key, value] of Object.entries(store)) {
      if (now - value.timestamp < MAX_AGE_MS) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

/**
 * Save the form data store to sessionStorage
 */
function saveFormDataStore(store: Record<string, StoredFormData>): void {
  if (Object.keys(store).length === 0) {
    sessionStorage.removeItem(FORM_DATA_KEY);
  } else {
    sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(store));
  }
}

/**
 * Push a new page context onto the stack and save form data for the current route
 * @param returnPath - The path to return to after the action (current page)
 * @param formData - The form data to preserve for the current page
 * @param scope - Optional scope/entity type identifier
 */
export function pushPageContext<T>(
  returnPath: string,
  formData: T,
  scope?: string,
): void {
  // Save form data for this route
  const formStore = getFormDataStore();
  formStore[returnPath] = {
    data: formData,
    scope,
    timestamp: Date.now(),
  };
  saveFormDataStore(formStore);

  // Push to stack
  const stack = getStack();
  stack.push({
    returnPath,
    scope,
    timestamp: Date.now(),
  });
  saveStack(stack);
}

/**
 * Pop the top page context from the stack
 * Returns the context to navigate back to, or null if stack is empty
 * Note: Does NOT remove the form data - that's done separately via clearFormData
 */
export function popPageContext(): PageContext | null {
  const stack = getStack();
  const context = stack.pop() || null;
  saveStack(stack);
  return context;
}

/**
 * Peek at the top page context without removing it
 */
export function peekPageContext(): PageContext | null {
  const stack = getStack();
  return stack.length > 0 ? stack[stack.length - 1] : null;
}

/**
 * Get saved form data for a specific route
 * @param route - The route to get form data for
 * @param expectedScope - Optional scope to validate against
 */
export function getFormData<T = unknown>(
  route: string,
  expectedScope?: string,
): T | null {
  const store = getFormDataStore();
  const stored = store[route];

  if (!stored) return null;

  // Validate scope if provided
  if (expectedScope && stored.scope !== expectedScope) {
    return null;
  }

  return stored.data as T;
}

/**
 * Clear form data for a specific route
 * Call this after successfully consuming the form data
 */
export function clearFormData(route: string): void {
  const store = getFormDataStore();
  delete store[route];
  saveFormDataStore(store);
}

/**
 * Clear the entire page stack and form data store
 * Call this on logout or when needed
 */
export function clearPageStack(): void {
  sessionStorage.removeItem(STACK_KEY);
  sessionStorage.removeItem(FORM_DATA_KEY);
  sessionStorage.removeItem(CREATED_ENTITY_KEY);
}

/**
 * Store the created entity for the destination page to consume
 */
export function setCreatedEntity<T>(entity: T, entityType: string): void {
  const data: CreatedEntityData<T> = { entity, entityType };
  sessionStorage.setItem(CREATED_ENTITY_KEY, JSON.stringify(data));
}

/**
 * Consume the created entity only if it matches the expected type
 * Returns the entity if type matches, null otherwise
 */
export function consumeCreatedEntity<T = unknown>(
  expectedEntityType: string,
): T | null {
  try {
    const data = sessionStorage.getItem(CREATED_ENTITY_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as CreatedEntityData<unknown>;

    // Only consume if entity type matches
    if (parsed.entityType !== expectedEntityType) {
      return null;
    }

    // Remove after consuming
    sessionStorage.removeItem(CREATED_ENTITY_KEY);
    return parsed.entity as T;
  } catch {
    return null;
  }
}
