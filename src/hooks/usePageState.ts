import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog, useNotification } from "./index";
import type { Identifiable } from "../types/common";
import {
  peekPageContext,
  popPageContext,
  hasPageContext,
  setCreatedEntity,
} from "../common/navigationStack";

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
   * Get stored original data
   */
  const getOriginalData = useCallback(<T>(): T | null => {
    return originalDataRef.current as T | null;
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
   * Check if there's a pending page context to return to
   */
  const hasPendingReturn = useCallback((): boolean => {
    return hasPageContext();
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
            // Use peek to get the returnPath without consuming the context yet
            const pageContext = peekPageContext();

            if (pageContext && response.data && scope) {
              // Store only the created entity - formData stays in the stack
              setCreatedEntity(response.data, scope);
              // Now pop to consume the context
              popPageContext();
              // Navigate back to the page that initiated the create
              setTimeout(() => navigate(pageContext.returnPath), redirectDelay);
            } else if (options?.entityRoute && entityId) {
              // Navigate to the newly created entity
              setTimeout(
                () => navigate(`${options.entityRoute}/${entityId}`),
                redirectDelay,
              );
            } else if (redirectOnSuccess) {
              // Fallback to configured redirect
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
   * Get form data from a create flow (call this once on page load)
   * Returns the preserved form data from the page stack
   * Note: createdEntity is auto-consumed by EntitySearch components via consumeCreatedEntity()
   */
  const getSavedFormData = useCallback(<TForm = unknown>(): TForm | null => {
    const context = popPageContext<TForm>();
    if (!context) return null;

    // Verify scope matches if provided
    if (scope && context.scope !== scope) {
      return null;
    }

    return context.formData;
  }, [scope]);

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
      navigate(pageContext.returnPath);
      return true;
    }
    return false;
  }, [navigate]);

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
    getOriginalData,
    hasPendingReturn,
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
