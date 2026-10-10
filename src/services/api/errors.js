/**
 * Maps API error codes to user-facing Arabic messages. Raw server messages,
 * stack traces and SQL errors are never shown to users.
 */
const BY_CODE = {
  NETWORK_ERROR: 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.',
  UNAUTHORIZED: 'انتهت جلستك أو أن بيانات الدخول غير صحيحة. يرجى تسجيل الدخول مرة أخرى.',
  TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  FORBIDDEN: 'ليست لديك صلاحية لتنفيذ هذا الإجراء.',
  FEATURE_DISABLED: 'هذه الميزة غير متاحة حالياً.',
  NOT_FOUND: 'العنصر المطلوب غير موجود أو تم حذفه.',
  VALIDATION_ERROR: 'يرجى مراجعة البيانات المدخلة.',
  CONFLICT: 'هذا العنصر موجود بالفعل.',
  INVALID_STATE: 'لا يمكن تنفيذ هذا الإجراء في الحالة الحالية.',
  RATE_LIMITED: 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مجدداً.',
  FILE_TOO_LARGE: 'حجم الملف يتجاوز الحد المسموح (50 ميجابايت).',
  UPLOAD_ERROR: 'تعذر رفع الملف. يرجى المحاولة مرة أخرى.',
  EMAIL_IN_USE: 'هذا البريد الإلكتروني مسجل بالفعل. جرّب تسجيل الدخول.',
  ACCOUNT_SUSPENDED: 'تم تعليق هذا الحساب. يرجى التواصل مع إدارة المنصة.',
  ACCOUNT_EXISTS: 'يوجد حساب مسجل بهذا البريد الإلكتروني. سجّل الدخول بكلمة المرور لربط حساب قوقل به.',
  GOOGLE_NOT_CONFIGURED: 'تسجيل الدخول عبر قوقل غير مفعّل على الخادم حالياً.',
  GOOGLE_ALREADY_LINKED: 'حساب قوقل هذا مرتبط بحساب آخر.',
  REGISTRATION_EXPIRED: 'انتهت مهلة إكمال التسجيل. يرجى المتابعة مع قوقل مرة أخرى.',
  INVALID_RESET_TOKEN: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً.',
  DUPLICATE_PROPOSAL: 'لقد قدمت عرضاً على هذا المشروع بالفعل.',
  DUPLICATE_REVIEW: 'لقد قمت بتقييم هذا العقد بالفعل.',
  DUPLICATE_REPORT: 'لديك بلاغ مفتوح بالفعل على هذا العنصر.',
  PAYMENT_PENDING: 'يوجد إثبات دفع لهذا العقد بانتظار مراجعة الإدارة.',
  PAYMENT_APPROVED: 'تم سداد هذا العقد بالفعل.',
  EMAIL_NOT_VERIFIED: 'يرجى تأكيد بريدك الإلكتروني أولاً.',
  VERIFICATION_CODE_INVALID: 'رمز التأكيد غير صحيح.',
  VERIFICATION_CODE_EXPIRED: 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.',
  VERIFICATION_TOO_MANY_ATTEMPTS: 'محاولات خاطئة كثيرة. اطلب رمزاً جديداً.',
  RESEND_TOO_SOON: 'يرجى الانتظار قليلاً قبل طلب رمز جديد.',
  EMAIL_DELIVERY_FAILED: 'تعذر إرسال البريد الإلكتروني حالياً. حاول مرة أخرى بعد قليل.',
  EMAIL_NOT_CONFIGURED: 'إرسال البريد الإلكتروني غير مفعّل على الخادم حالياً. تواصل مع إدارة المنصة.',
  INTERNAL_SERVER_ERROR: 'حدث خطأ غير متوقع في الخادم. يرجى المحاولة لاحقاً.',
};

// Selected backend business messages that are safe and useful to show.
const BY_MESSAGE = {
  'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'Incorrect old password': 'كلمة المرور الحالية غير صحيحة.',
  'This project is no longer accepting proposals': 'هذا المشروع لم يعد يستقبل العروض.',
  'Only pending proposals can be changed': 'يمكن تعديل أو سحب العروض المعلقة فقط.',
  'Proposal is not pending': 'هذا العرض لم يعد معلقاً.',
  'Project is no longer open': 'المشروع لم يعد مفتوحاً.',
  'Only open projects can be edited': 'يمكن تعديل المشاريع المفتوحة فقط.',
  'Only open projects can be deleted': 'يمكن حذف المشاريع المفتوحة فقط.',
  'Only open projects can be closed': 'يمكن إغلاق المشاريع المفتوحة فقط.',
  'This project already has proposals. Close it instead of deleting it.': 'هذا المشروع لديه عروض بالفعل. يمكنك إغلاقه بدلاً من حذفه.',
  'Work can only be submitted on an active contract': 'يمكن تسليم العمل على العقود السارية فقط.',
  "Your previous delivery is still awaiting the client's review": 'تسليمك السابق ما زال بانتظار مراجعة العميل.',
  'There is no submitted work to review': 'لا يوجد عمل مسلّم بانتظار المراجعة.',
  'Work has not been submitted for review': 'لم يتم تسليم العمل للمراجعة بعد.',
  'Reviews are available after the contract is completed': 'التقييم متاح بعد اكتمال العقد.',
  'This contract is not awaiting payment': 'هذا العقد لا ينتظر الدفع.',
  'Once payment is approved, only the platform administration can cancel this contract. Please open a dispute.':
    'بعد اعتماد الدفع لا يمكن إلغاء العقد إلا من قبل الإدارة. يمكنك فتح نزاع.',
  'The paid amount is less than the contract value. Reject the payment with a reason instead.':
    'المبلغ المدفوع أقل من قيمة العقد. يرجى رفض الدفعة مع ذكر السبب.',
  'Approve the withdrawal before recording the payout': 'يجب اعتماد طلب السحب قبل تسجيل التحويل.',
  'This withdrawal has already been paid': 'تم تسجيل تحويل هذا الطلب مسبقاً.',
  'The paid amount must equal the requested amount.': 'يجب أن يساوي المبلغ المحوّل المبلغ المطلوب.',
  'You cannot change the status of your own account': 'لا يمكنك تغيير حالة حسابك الخاص.',
  'The Google account email must match your account email.': 'يجب أن يطابق بريد حساب قوقل بريد حسابك.',
  'Your Google email address is not verified.': 'بريد حساب قوقل غير موثق.',
  'Google sign-in could not be verified. Please try again.': 'تعذر التحقق من تسجيل الدخول عبر قوقل. حاول مرة أخرى.',
  'Unsupported file type. Allowed: PDF, DOC, DOCX, ZIP, PNG, JPG, JPEG.': 'نوع الملف غير مدعوم. الأنواع المسموحة: PDF, DOC, DOCX, ZIP, PNG, JPG.',
  'The file content does not match its type.': 'محتوى الملف لا يطابق نوعه.',
  'Please upload an image (PNG or JPG).': 'يرجى رفع صورة بصيغة PNG أو JPG.',
  'Message cannot be empty': 'لا يمكن إرسال رسالة فارغة.',
  'You already have an open report for this item': 'لديك بلاغ مفتوح بالفعل على هذا العنصر.',
  'Please choose a valid category': 'يرجى اختيار تصنيف صالح.',
};

export const translateError = (code, message, status) => {
  if (message && BY_MESSAGE[message]) return BY_MESSAGE[message];
  if (message && message.startsWith('The requested amount exceeds your available balance')) {
    return 'المبلغ المطلوب يتجاوز رصيدك المتاح للسحب.';
  }
  if (code && BY_CODE[code]) return BY_CODE[code];
  if (status >= 500) return BY_CODE.INTERNAL_SERVER_ERROR;
  if (status === 404) return BY_CODE.NOT_FOUND;
  if (status === 403) return BY_CODE.FORBIDDEN;
  return 'حدث خطأ غير متوقع، يرجى المحاولة ثانية.';
};
