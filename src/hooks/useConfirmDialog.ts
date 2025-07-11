import { useState } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const showConfirm = (message: string, callback: () => void) => {
    setMessage(message);
    setOnConfirm(() => callback);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setIsOpen(false);
    setOnConfirm(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setOnConfirm(null);
  };

  return {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel,
  };
}