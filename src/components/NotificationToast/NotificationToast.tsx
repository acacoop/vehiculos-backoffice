import { useEffect } from "react";
import "./NotificationToast.css";

// Definimos los tipos de notificación
export type NotificationType = "success" | "error" | "warning" | "info";

// Props que va a recibir el componente
interface NotificationToastProps {
  message: string;
  type?: NotificationType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function NotificationToast({
  message,
  type = "info",
  isOpen,
  onClose,
  duration = 3000
}: NotificationToastProps) {
  // Auto-cerrar después del tiempo especificado
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`notification-toast notification-${type}`}>
      <p>{message}</p>
      <button onClick={onClose} className="notification-close">
        ×
      </button>
    </div>
  );
}
