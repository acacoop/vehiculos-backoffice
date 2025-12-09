/**
 * Page Stack for navigation with context preservation
 *
 * Manages a stack of page contexts so that nested navigation flows
 * (e.g., Vehicle → Model → Brand) can properly return through each level
 * with all the form data preserved.
 */

export interface PageContext<T = unknown> {
  /** The path to return to */
  returnPath: string;
  /** Form data to restore */
  formData: T;
  /** Scope/Entity type of the page that pushed this context */
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

const STORAGE_KEY = "page_stack";
const CREATED_ENTITY_KEY = "created_entity";
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get the current page stack from sessionStorage
 */
function getStack(): PageContext[] {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
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
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  }
}

/**
 * Push a new page context onto the stack
 * @param returnPath - The path to return to after the action
 * @param formData - The form data to preserve
 * @param scope - Optional scope/entity type identifier
 */
export function pushPageContext<T>(
  returnPath: string,
  formData: T,
  scope?: string,
): void {
  const stack = getStack();
  stack.push({
    returnPath,
    formData,
    scope,
    timestamp: Date.now(),
  });
  saveStack(stack);
}

/**
 * Pop the top page context from the stack
 * Returns the context to navigate back to, or null if stack is empty
 */
export function popPageContext<T = unknown>(): PageContext<T> | null {
  const stack = getStack();
  const context = stack.pop() || null;
  saveStack(stack);
  return context as PageContext<T> | null;
}

/**
 * Peek at the top page context without removing it
 */
export function peekPageContext<T = unknown>(): PageContext<T> | null {
  const stack = getStack();
  return stack.length > 0 ? (stack[stack.length - 1] as PageContext<T>) : null;
}

/**
 * Check if there's a pending page context
 */
export function hasPageContext(): boolean {
  return getStack().length > 0;
}

/**
 * Clear the entire page stack
 * Call this on logout or when needed
 */
export function clearPageStack(): void {
  sessionStorage.removeItem(STORAGE_KEY);
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
