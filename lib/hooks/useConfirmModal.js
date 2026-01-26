import { useState, useCallback } from "react";

/**
 * useConfirmModal Hook
 *
 * Manages the state and actions of a confirmation modal
 *
 * Usage:
 * const { isOpen, modalProps, open, close, confirm } = useConfirmModal();
 *
 * open({
 *   type: 'danger',
 *   title: 'Delete Item',
 *   message: 'Are you sure?',
 *   confirmText: 'Delete',
 *   onConfirm: handleDelete
 * });
 */

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "confirm",
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
    loading: false,
    showIcon: true,
  });

  const open = useCallback((options = {}) => {
    setModalProps((prev) => ({
      ...prev,
      ...options,
      loading: false,
    }));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback(async () => {
    setModalProps((prev) => ({ ...prev, loading: true }));
    try {
      if (modalProps.onConfirm) {
        await modalProps.onConfirm();
      }
    } finally {
      setIsOpen(false);
      setModalProps((prev) => ({ ...prev, loading: false }));
    }
  }, [modalProps]);

  const cancel = useCallback(() => {
    if (modalProps.onCancel) {
      modalProps.onCancel();
    }
    setIsOpen(false);
  }, [modalProps]);

  return {
    isOpen,
    modalProps,
    open,
    close,
    confirm,
    cancel,
  };
};
