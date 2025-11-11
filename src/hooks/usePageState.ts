import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog, useNotification } from "./index";

interface UsePageStateOptions {
  redirectOnSuccess?: string;
  redirectDelay?: number;
}

export function usePageState(options: UsePageStateOptions = {}) {
  const { redirectOnSuccess, redirectDelay = 1500 } = options;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
   */
  const executeSave = async (
    confirmMessage: string,
    operation: () => Promise<{ success: boolean; message?: string }>,
    successMessage: string,
  ): Promise<void> => {
    showConfirm(confirmMessage, async () => {
      setSaving(true);
      try {
        const response = await operation();

        if (response.success) {
          showSuccess(successMessage);
          if (redirectOnSuccess) {
            setTimeout(() => navigate(redirectOnSuccess), redirectDelay);
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

  return {
    // State
    loading,
    saving,
    isDialogOpen,
    dialogMessage,
    notification,

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
