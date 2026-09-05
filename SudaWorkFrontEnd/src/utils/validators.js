/**
 * Validation helpers for forms in SudaWork
 */

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim().toLowerCase());
};

export const validateEmail = (email) => {
  if (!email || !String(email).trim()) {
    return 'البريد الإلكتروني مطلوب';
  }
  if (!isValidEmail(email)) {
    return 'يرجى إدخال بريد إلكتروني صحيح';
  }
  return null;
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return 'كلمة المرور مطلوبة';
  }
  if (password.length < minLength) {
    return `كلمة المرور يجب ألا تقل عن ${minLength} أحرف`;
  }
  return null;
};

export const validateRequired = (value, fieldName = 'هذا الحقل') => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${fieldName} مطلوب`;
  }
  return null;
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  const firstNameError = validateRequired(formData.firstName, 'الاسم الأول');
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateRequired(formData.lastName, 'الاسم الأخير');
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password, 6);
  if (passwordError) errors.password = passwordError;

  if (formData.agreeTerms === false) {
    errors.agreeTerms = 'يجب الموافقة على الشروط والأحكام للمتابعة';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (email, password) => {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password, 1);
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
