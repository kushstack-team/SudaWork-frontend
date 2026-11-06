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

/**
 * Project budget for display: "6,000 ج.س" (fixed) or "300,000 - 400,000 ج.س" (range).
 */
export const formatBudget = (min, max) => {
  const fmt = (n) => Number(n || 0).toLocaleString('en-US');
  return max ? `${fmt(min)} - ${fmt(max)} ج.س` : `${fmt(min)} ج.س`;
};

// Arabic names for the payment / payout methods stored in English by the API.
const PAYMENT_METHOD_LABELS = {
  Bankak: 'بنكك (بنك الخرطوم)',
  'Bank Transfer': 'تحويل بنكي',
  'Zain Cash': 'زين كاش',
  'MTN Cash': 'MTN كاش',
  Other: 'أخرى',
};
export const paymentMethodLabel = (method) => PAYMENT_METHOD_LABELS[method] || method || '';
