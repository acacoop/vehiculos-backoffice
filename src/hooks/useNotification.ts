import { useState } from "react";
import type { NotificationType } from "../components/NotificationToast/NotificationToast";

// Interface para el estado de la notificación
interface NotificationState {
  isOpen: boolean;
  message: string;
  type: NotificationType;
}

// Hook personalizado para manejar notificaciones
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    message: "",
    type: "info",
  });

  // Función para mostrar una notificación
  const showNotification = (message: string, type: NotificationType = "info") => {
    setNotification({
      isOpen: true,
      message,
      type,
    });
  };

  // Función para cerrar la notificación
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Métodos de conveniencia para cada tipo
  const showSuccess = (message: string) => showNotification(message, "success");
  const showError = (message: string) => showNotification(message, "error");
  const showWarning = (message: string) => showNotification(message, "warning");
  const showInfo = (message: string) => showNotification(message, "info");

  return {
    notification,
    showNotification,
    closeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
