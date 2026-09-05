import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import './ConfirmModal.css';

/**
 * Reusable accessible modal dialog to replace window.confirm()
 * Supports keyboard navigation (Escape to cancel, auto-focus confirm)
 */
export default function ConfirmModal({
  isOpen,
  title = 'تأكيد الإجراء',
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  onConfirm,
  onCancel,
  isLoading = false
}) {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus confirm button when modal opens
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);

      // Handle Escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isLoading) {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'danger':
        return <FiAlertTriangle className="confirm-icon danger" />;
      case 'success':
        return <FiCheckCircle className="confirm-icon success" />;
      case 'info':
        return <FiInfo className="confirm-icon info" />;
      case 'warning':
      default:
        return <FiAlertTriangle className="confirm-icon warning" />;
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={!isLoading ? onCancel : undefined} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onCancel} disabled={isLoading} aria-label="إغلاق">
          <FiX />
        </button>

        <div className="confirm-modal-header">
          <div className={`confirm-icon-wrapper ${type}`}>
            {renderIcon()}
          </div>
          <h3 id="confirm-modal-title" className="confirm-modal-title">{title}</h3>
        </div>

        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            ref={confirmButtonRef}
            type="button"
            className={`btn-confirm ${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التنفيذ...' : confirmText}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
