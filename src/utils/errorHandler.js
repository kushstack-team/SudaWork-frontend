/**
 * User-friendly Error Message Extractor
 */
export const getErrorMessage = (error, fallback = 'حدث خطأ غير متوقع، يرجى المحاولة ثانية.') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  return fallback;
};
