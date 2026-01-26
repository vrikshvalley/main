'use client';

import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import Button from '@/components/general/Button';
import '@/styles/confirmModal.scss';

/**
 * Confirmation Modal Component
 * 
 * Displays a beautiful modal for user confirmations instead of browser alerts
 * 
 * Types: confirm, warning, danger, info, success
 * 
 * Example:
 * const { isOpen, open, close, confirm } = useConfirmModal();
 * 
 * open({
 *   type: 'danger',
 *   title: 'Delete Address',
 *   message: 'Are you sure you want to delete this address?',
 *   confirmText: 'Delete',
 *   onConfirm: handleDelete
 * });
 */

const ConfirmModal = ({
  isOpen,
  type = 'confirm',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  showIcon = true,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    confirm: {
      icon: AlertCircle,
      color: 'teal',
      bgColor: 'rgba(20, 184, 166, 0.1)',
    },
    warning: {
      icon: AlertCircle,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    danger: {
      icon: XCircle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    info: {
      icon: Info,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    success: {
      icon: CheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  };

  const config = typeConfig[type] || typeConfig.confirm;
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="confirm-modal-backdrop" onClick={handleCancel} />

      {/* Modal */}
      <div className={`confirm-modal confirm-modal-${type}`}>
        {/* Icon */}
        {showIcon && (
          <div className="confirm-modal-icon" style={{ backgroundColor: config.bgColor }}>
            <Icon color={config.color} size={40} />
          </div>
        )}

        {/* Content */}
        <div className="confirm-modal-content">
          {title && <h2 className="confirm-modal-title">{title}</h2>}
          {message && <p className="confirm-modal-message">{message}</p>}
        </div>

        {/* Actions */}
        <div className="confirm-modal-actions">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancel}
            disabled={loading}
            fullWidth
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'primary'}
            size="md"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
