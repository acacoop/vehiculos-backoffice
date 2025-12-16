import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useConfirmDialog, useNotification } from "./index";
import type { Identifiable } from "../types/common";
import {
  peekPageContext,
  popPageContext,
  pushPageContext,
  setPendingFormData,
  getFormData,
  clearFormData,
  consumePendingFormData,
} from "../common/navigationStack";

interface UsePageStateOptions<TForm = unknown> {
  redirectOnSuccess?: string;
  redirectDelay?: number;
  /** If true, form starts in view mode (non-editable) for existing items */
  startInViewMode?: boolean;
  /** Scope/Entity type for navigation stack safety (e.g., "vehicle", "brand") */
  scope?: string;
  /** Default/empty form state for new entities */
  defaultFormState?: TForm;
  /**
   * Callback when initial form data is ready.
   * Called once on mount with merged data from:
   * 1. defaultFormState
   * 2. Saved form data (from navigation stack return flow)
   * 3. Pending form data (from parent page or created entity)
   */
  onInitialData?: (data: TForm) => void;
}

export function usePageState<TForm = unknown>(
  options: UsePageStateOptions<TForm> = {},
) {
  const {
    redirectOnSuccess,
    redirectDelay = 1500,
    startInViewMode = false,
    scope,
    defaultFormState,
    onInitialData,
  } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!startInViewMode);

  // Track if initial data has been processed
  const initialDataProcessedRef = useRef(false);

  // Store original data for cancel/restore functionality
  const originalDataRef = useRef<unknown>(null);

  const {
    isOpen: isDialogOpen,
    message: dialogMessage,
    showConfirm,
    handleConfirm,
    handleCancel: handleDialogCancel,
  } = useConfirmDialog();

  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  /**
   * Process initial form data on mount (for new entities only).
   * Merges: defaultFormState < savedFormData < pendingFormData
   * Priority: pending data wins over saved, saved wins over default.
   */
  useEffect(() => {
    // Only run once and only if we have a callback
    if (initialDataProcessedRef.current || !onInitialData) return;

    // Only process for new entities (when not in view mode initially)
    if (startInViewMode) return;

    initialDataProcessedRef.current = true;

    const currentPath = location.pathname;

    // Start with default
    let mergedData: TForm = defaultFormState ?? ({} as TForm);

    // Layer 1: Saved form data (from stack return flow)
    const savedData = getFormData<TForm>(currentPath, scope);
    if (savedData) {
      mergedData = { ...mergedData, ...savedData };
    }

    // Layer 2: Pending form data (from parent page or created entity) - highest priority
    const pendingData = consumePendingFormData<Partial<TForm>>(currentPath);
    if (pendingData) {
      mergedData = { ...mergedData, ...pendingData };
    }

    // Call the callback with merged data
    onInitialData(mergedData);
  }, [
    location.pathname,
    scope,
    startInViewMode,
    defaultFormState,
    onInitialData,
  ]);

  /**
   * Store original form data to restore on cancel
   */
  const setOriginalData = useCallback(<T>(data: T) => {
    originalDataRef.current = structuredClone(data);
  }, []);

  /**
   * Enable edit mode
   */
  const enableEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  /**
   * Cancel editing and restore original data
   * Returns the original data so the page can restore its state
   */
  const cancelEdit = useCallback(<T>(): T | null => {
    setIsEditing(false);
    return originalDataRef.current as T | null;
  }, []);

  /**
   * Executes an async operation with loading state management and error handling
   */
  const executeLoad = async <T>(
    operation: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T | null> => {
    setLoading(true);
    try {
      return await operation();
    } catch (err) {
      const message =
        errorMessage ||
        `Error: ${err instanceof Error ? err.message : String(err)}`;
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Executes a save/update operation with confirmation dialog
   * For create: checks page stack first, then falls back to entityRoute or redirectOnSuccess
   * For update: exits edit mode instead of redirecting
   */
  const executeSave = async <T extends Identifiable | void = Identifiable>(
    confirmMessage: string,
    operation: () => Promise<{ success: boolean; message?: string; data?: T }>,
    successMessage: string,
    options?: {
      isCreate?: boolean;
      entityRoute?: string; // e.g., "/vehicles" - will navigate to /vehicles/:id
    },
  ): Promise<void> => {
    showConfirm(confirmMessage, async () => {
      setSaving(true);
      try {
        const response = await operation();

        if (response.success) {
          showSuccess(successMessage);

          const entityId = response.data?.id;

          if (options?.isCreate) {
            // Check page stack (from EntitySearch create flow)
            const pageContext = peekPageContext();

            if (pageContext && response.data && scope) {
              // Store the created entity as pending data for the destination page
              // The destination will merge it into its form via onInitialData
              setPendingFormData(pageContext.returnPath, {
                [scope]: response.data,
              });
              // Clear form data for the current route (we're done with it)
              clearFormData(location.pathname);
              // Pop the navigation context
              popPageContext();
              // Navigate back to the page that initiated the create
              setTimeout(() => navigate(pageContext.returnPath), redirectDelay);
            } else if (options?.entityRoute && entityId) {
              // No stack context - navigate to the newly created entity
              // Clear any saved form data for this route
              clearFormData(location.pathname);
              setTimeout(
                () => navigate(`${options.entityRoute}/${entityId}`),
                redirectDelay,
              );
            } else if (redirectOnSuccess) {
              // Fallback to configured redirect
              clearFormData(location.pathname);
              setTimeout(() => navigate(redirectOnSuccess), redirectDelay);
            }
          } else {
            // For update: exit edit mode, don't redirect
            setIsEditing(false);
            // Update original data with new saved data
            if (response.data && typeof response.data === "object") {
              originalDataRef.current = structuredClone(response.data);
            }
          }
        } else {
          showError(response.message || "Error al realizar la operación");
        }
      } catch (err) {
        showError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setSaving(false);
      }
    });
  };

  /**
   * Navigates to a different route
   */
  const goTo = (path: string) => navigate(path);

  /**
   * Navigate to a route with initial form data.
   * The destination page will receive this data via onInitialData callback.
   *
   * @param path - The route to navigate to
   * @param initialData - Partial form data to preload in the destination
   *
   * @example
   * // From VehiclePage, navigate to create assignment with vehicle preloaded
   * goToWithData("/vehicles/assignments/new", { vehicle: currentVehicle });
   */
  const goToWithData = useCallback(
    <T = unknown>(path: string, initialData: T) => {
      // Push current page to stack so cancelCreate can return here
      pushPageContext(location.pathname);
      setPendingFormData(path, initialData);
      navigate(path);
    },
    [navigate, location.pathname],
  );

  /**
   * Cancels a create operation and returns to the previous page if one exists in the stack.
   * Returns true if navigation was handled (stack had context), false otherwise.
   */
  const cancelCreate = useCallback((): boolean => {
    const pageContext = popPageContext();
    if (pageContext) {
      // Clear form data for the current route since we're canceling
      clearFormData(location.pathname);
      navigate(pageContext.returnPath);
      return true;
    }
    return false;
  }, [navigate, location.pathname]);

  return {
    // State
    loading,
    saving,
    isEditing,
    isDialogOpen,
    dialogMessage,
    notification,

    // Edit mode actions
    enableEdit,
    cancelEdit,
    cancelCreate,
    setOriginalData,

    // Actions
    executeLoad,
    executeSave,
    showSuccess,
    showError,
    goTo,
    goToWithData,

    // Dialog handlers
    handleDialogConfirm: handleConfirm,
    handleDialogCancel,
    closeNotification,
  };
}
