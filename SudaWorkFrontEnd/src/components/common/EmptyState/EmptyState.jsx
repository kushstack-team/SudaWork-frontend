import React from 'react';
import { FiInbox } from 'react-icons/fi';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'لا توجد بيانات',
  description,
  actionText,
  onAction
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        <Icon />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {actionText && onAction && (
        <button type="button" className="empty-state-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
