/**
 * Feature identifiers controlled from the admin dashboard.
 * Must match the backend registry (backend/src/core/features/registry.js).
 * Availability itself always comes from GET /settings/public — never from here.
 */
export const FEATURES = Object.freeze({
  PROJECT_BROWSING: 'project_browsing',
  PROJECT_POSTING: 'project_posting',
  FREELANCER_DIRECTORY: 'freelancer_directory',
  PROPOSALS: 'proposals',
  MESSAGING: 'messaging',
  PORTFOLIO: 'portfolio',
  PAYMENT_REQUESTS: 'payment_requests',
  WITHDRAWALS: 'withdrawals',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  DISPUTES: 'disputes',
});

// Arabic labels for the admin feature-management screen.
export const FEATURE_LABELS = Object.freeze({
  project_browsing: { name: 'تصفح المشاريع', description: 'عرض المشاريع المفتوحة والبحث فيها.' },
  project_posting: { name: 'نشر المشاريع', description: 'إنشاء المشاريع وتعديلها من قبل العملاء.' },
  freelancer_directory: { name: 'دليل المستقلين', description: 'تصفح ملفات المستقلين والبحث عنهم.' },
  proposals: { name: 'تقديم العروض', description: 'تقديم العروض وتعديلها وسحبها من قبل المستقلين.' },
  messaging: { name: 'المحادثات', description: 'المراسلة الخاصة بين العملاء والمستقلين.' },
  portfolio: { name: 'معرض الأعمال', description: 'إضافة نماذج الأعمال إلى ملف المستقل.' },
  payment_requests: { name: 'طلبات الدفع', description: 'إرسال إثباتات الدفع اليدوي للعقود.' },
  withdrawals: { name: 'طلبات السحب', description: 'طلب سحب الأرباح المتاحة للمستقلين.' },
  reviews: { name: 'التقييمات', description: 'تقييم الطرف الآخر بعد اكتمال العقد.' },
  notifications: { name: 'الإشعارات', description: 'مركز الإشعارات داخل المنصة.' },
  disputes: { name: 'النزاعات والبلاغات', description: 'فتح النزاعات على العقود والإبلاغ عن المخالفات.' },
});
