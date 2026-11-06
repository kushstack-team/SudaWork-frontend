const ARABIC_DIGITS = /[٠-٩]/g;

/**
 * Normalizes typed numbers: Arabic-Indic digits (٠-٩) become 0-9, anything
 * that isn't a digit is dropped, and leading zeros are removed.
 */
export const toDigits = (text) =>
  String(text ?? '')
    .replace(ARABIC_DIGITS, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d]/g, '')
    .replace(/^0+(?=\d)/, '');
