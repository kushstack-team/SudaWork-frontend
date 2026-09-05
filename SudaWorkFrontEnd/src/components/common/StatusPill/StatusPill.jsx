import React from 'react';
import './StatusPill.css';

/**
 * Standardized status badge/pill for projects, contracts, proposals, and withdrawals
 */
export default function StatusPill({ status, label, variant }) {
  // Determine variant if not explicitly passed
  const getVariant = () => {
    if (variant) return variant;
    switch (status) {
      case 'completed':
      case 'active':
      case 'accepted':
      case 'paid':
      case 'approved':
        return 'success';
      case 'in_progress':
      case 'under_review':
      case 'pending':
      case 'submitted':
      case 'awaiting_payment':
        return 'warning';
      case 'revision_requested':
      case 'disputed':
        return 'info';
      case 'rejected':
      case 'cancelled':
        return 'danger';
      case 'open':
      default:
        return 'neutral';
    }
  };

  return (
    <span className={`status-pill ${getVariant()}`}>
      {label || status}
    </span>
  );
}
