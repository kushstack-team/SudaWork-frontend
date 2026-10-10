/**
 * Centralized Financial & Commission Logic for SudaWork Marketplace.
 * Future real backend should be the single source of truth for transactions and balances.
 */

export const DEFAULT_COMMISSION_PERCENT = 10;

/**
 * Calculates platform commission fee based on gross agreed amount.
 */
export const calculatePlatformFee = (grossAmount, commissionPercent = DEFAULT_COMMISSION_PERCENT) => {
  const amount = Number(grossAmount) || 0;
  const rate = Number(commissionPercent) / 100;
  return Math.round(amount * rate);
};

/**
 * Calculates net freelancer earnings after platform commission fee.
 */
export const calculateFreelancerNet = (grossAmount, commissionPercent = DEFAULT_COMMISSION_PERCENT) => {
  const amount = Number(grossAmount) || 0;
  const fee = calculatePlatformFee(amount, commissionPercent);
  return Math.max(0, amount - fee);
};

/**
 * Formats a number to Sudanese Pounds (ج.س) currency string.
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('ar-EG')} ج.س`;
};

/**
 * Standardized budget display helper for projects supporting both fixed amount and range models.
 */
export const getProjectBudgetDisplay = (project) => {
  if (!project) return 'غير محدد';
  
  // Object budget format: { type, amount, min, max }
  if (typeof project.budget === 'object' && project.budget !== null) {
    if (project.budget.type === 'range' || (project.budget.min && project.budget.max)) {
      return `${Number(project.budget.min).toLocaleString('ar-EG')} - ${Number(project.budget.max).toLocaleString('ar-EG')} ج.س`;
    }
    return formatCurrency(project.budget.amount || 0);
  }

  // Legacy flat fields: budgetMin and budgetMax
  if (project.budgetMin && project.budgetMax) {
    return `${Number(project.budgetMin).toLocaleString('ar-EG')} - ${Number(project.budgetMax).toLocaleString('ar-EG')} ج.س`;
  }

  // Flat budget amount
  if (project.budget) {
    return formatCurrency(project.budget);
  }

  return 'غير محدد';
};
