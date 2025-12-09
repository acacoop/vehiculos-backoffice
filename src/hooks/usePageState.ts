import { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useConfirmDialog, useNotification } from "./index";
import type { Identifiable } from "../types/common";
import {
  peekPageContext,
  popPageContext,
  setCreatedEntity,
  getFormData,
  clearFormData,
  consumeCreatedEntity,
} from "../common/navigationStack";

/** Mapping of entityType to field name for auto-merging created entities */
export type EntityFieldMapping = Record<string, string>;

interface UsePageStateOptions {
  redirectOnSuccess?: string;
  redirectDelay?: number;
  /** If true, form starts in view mode (non-editable) for existing items */
  startInViewMode?: boolean;
  /** Scope/Entity type for navigation stack safety (e.g., "vehicle", "brand") */
  scope?: string;
}

export function usePageState(options: UsePageStateOptions = {}) {
  const {
    redirectOnSuccess,
    redirectDelay = 1500,
    startInViewMode = false,
    scope,
  } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!startInViewMode);

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
              // Store the created entity for the destination page to consume
              setCreatedEntity(response.data, scope);
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
   * Get form data saved for the current route (call this once on page load)
   * If entityFieldMapping is provided, will also consume any pending created entity
   * and merge it into the returned form data.
   *
   * @param entityFieldMapping - Optional mapping of entityType to field name
   *   e.g., { brand: "brand", model: "model" }
   *   If the created entity's type matches a key, it will be set on that field
   *
   * @example
   * // Without entity mapping (just restore form data)
   * const savedData = getSavedFormData<FormType>();
   *
   * // With entity mapping (restore + merge created entity)
   * const savedData = getSavedFormData<FormType>({ brand: "brand" });
   */
  const getSavedFormData = useCallback(
    <TForm = unknown>(
      entityFieldMapping?: EntityFieldMapping,
    ): TForm | null => {
      const currentPath = location.pathname;
      const formData = getFormData<TForm>(currentPath, scope);

      if (!formData) return null;

      // If we have an entity mapping, try to consume and merge created entity
      if (entityFieldMapping) {
        for (const [entityType, fieldName] of Object.entries(
          entityFieldMapping,
        )) {
          const createdEntity = consumeCreatedEntity(entityType);
          if (createdEntity) {
            // Merge the created entity into the form data
            return {
              ...formData,
              [fieldName]: createdEntity,
            };
          }
        }
      }

      return formData;
    },
    [location.pathname, scope],
  );

  /**
   * Navigates to a different route
   */
  const goTo = (path: string) => navigate(path);

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
    getSavedFormData,

    // Actions
    executeLoad,
    executeSave,
    showSuccess,
    showError,
    goTo,

    // Dialog handlers
    handleDialogConfirm: handleConfirm,
    handleDialogCancel,
    closeNotification,
  };
}
