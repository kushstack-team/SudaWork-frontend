/**
 * Standardized Date, Time, and Text Formatters for SudaWork (Arabic-first / Sudan Locale)
 */

export const formatDate = (isoString, options = {}) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-SD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  } catch {
    return String(isoString);
  }
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-SD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(isoString);
  }
};

export const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'الآن';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'أمس';
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    return formatDate(isoString);
  } catch {
    return '';
  }
};

export const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('ar-EG');
};
