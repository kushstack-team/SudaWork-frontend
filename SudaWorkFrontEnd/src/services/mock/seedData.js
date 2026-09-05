const avatarTasneem = new URL('../../assets/dashboard/avatar_tasneem.jpg', import.meta.url).href;
const avatarOmar = new URL('../../assets/dashboard/avatar_omar.jpg', import.meta.url).href;
const avatarAhmed = new URL('../../assets/dashboard/avatar_ahmed.jpg', import.meta.url).href;
const videoUgc = new URL('../../assets/dashboard/video_ugc.jpg', import.meta.url).href;
const marketingAds = new URL('../../assets/dashboard/marketing_ads.jpg', import.meta.url).href;
import { ROLES, PROJECT_STATUS, CONTRACT_STATUS, PROPOSAL_STATUS, PAYMENT_STATUS, WITHDRAWAL_STATUS } from '../../constants/index.js';

export const defaultCategories = [
  { id: 'web-dev', name: 'تطوير المواقع' },
  { id: 'mobile-dev', name: 'تطوير تطبيقات الجوال' },
  { id: 'ai', name: 'الذكاء الاصطناعي' },
  { id: 'ui-ux', name: 'تصميم واجهات وتجربة المستخدم' },
  { id: 'graphic-design', name: 'التصميم الجرافيكي' },
  { id: 'video-editing', name: 'المونتاج وتحرير الفيديو' },
  { id: 'marketing', name: 'التسويق الرقمي' },
  { id: 'data-entry', name: 'إدخال البيانات' },
  { id: 'writing', name: 'الكتابة وصناعة المحتوى' },
  { id: 'translation', name: 'الترجمة واللغات' },
];

export const defaultUsers = [
  {
    id: 'user_client_1',
    fullName: 'طارق عبد المحمود',
    email: 'tarig@alnilam.sd',
    passwordHash: 'password123',
    role: ROLES.CLIENT,
    createdAt: '2026-01-10T10:00:00.000Z',
    status: 'active',
  },
  {
    id: 'user_freelancer_1',
    fullName: 'تسنيم الطيب',
    email: 'tasneem@dev.sd',
    passwordHash: 'password123',
    role: ROLES.FREELANCER,
    createdAt: '2026-01-12T14:30:00.000Z',
    status: 'active',
  },
  {
    id: 'user_freelancer_2',
    fullName: 'عمر فاروق',
    email: 'omar@sudawork.com',
    passwordHash: 'password123',
    role: ROLES.FREELANCER,
    createdAt: '2026-01-15T09:15:00.000Z',
    status: 'active',
  },
  {
    id: 'user_admin_1',
    fullName: 'مدير النظام',
    email: 'admin@sudawork.com',
    passwordHash: 'admin123',
    role: ROLES.ADMIN,
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'active',
  },
];

export const defaultFreelancerProfiles = [
  {
    userId: 'user_freelancer_1',
    photo: avatarTasneem,
    title: 'منتجة ومحررة فيديو تسويقي وإعلاني (UGC)',
    bio: 'أخصائية مونتاج وإنتاج فيديوهات ترويجية وإعلانية للمتاجر والشركات بخبرة 4 سنوات، مع التركيز على أعلى معايير الجودة الجاذبة للمستهلكين.',
    skills: ['UGC Video', 'After Effects', 'Premiere Pro', 'صناعة المحتوى', 'تصوير إعلاني'],
    portfolio: [
      { id: 'p1', title: 'حملة إعلانية لمتجر إلكتروني', image: videoUgc, link: 'https://example.com/p1' },
    ],
    location: 'الخرطوم، السودان',
    availability: 'available',
    avgRating: 5.0,
    completedProjects: 14,
  },
  {
    userId: 'user_freelancer_2',
    photo: avatarOmar,
    title: 'خبير إدارة الحملات الإعلانية والتسويق الرقمي',
    bio: 'متخصص في تخطيط وتنفيذ الحملات الإعلانية الممولة على ميتا وجوجل وتيك توك لتحقيق أعلى عائد على الاستثمار (ROAS).',
    skills: ['Facebook Ads', 'Google Ads', 'SEO', 'التسويق عبر السوشيال ميديا'],
    portfolio: [
      { id: 'p2', title: 'إدارة حملة تسويقية لشركة تقنية', image: marketingAds, link: 'https://example.com/p2' },
    ],
    location: 'بورتسودان، السودان',
    availability: 'available',
    avgRating: 4.8,
    completedProjects: 22,
  },
];

export const defaultClientProfiles = [
  {
    userId: 'user_client_1',
    companyName: 'مؤسسة الرواد للحلول الرقمية',
    logo: avatarAhmed,
    description: 'شركة متخصصة في تقديم الاستشارات والحلول التقنية والخدمات الرقمية للمؤسسات والشركات الناشئة في الشرق الأوسط.',
    contactInfo: { phone: '+249912345678', location: 'الخرطوم، السودان' },
    postedProjectsCount: 3,
  },
];

export const defaultProjects = [
  {
    id: 'proj_1',
    clientId: 'user_client_1',
    title: 'تطوير منصة وتطبيق ويب متجاوب باستخدام React و Node.js',
    description: 'نبحث عن مهندس برمجيات محترف لبناء واجهة مستخدم متقدمة مع لوحة تحكم للعملاء ودعم التصفح باللغتين العربية والإنجليزية.',
    categoryId: 'web-dev',
    budget: 450000,
    budgetMin: 400000,
    budgetMax: 500000,
    deadline: '2026-10-15',
    status: PROJECT_STATUS.OPEN,
    createdAt: '2026-08-25T11:00:00.000Z',
  },
  {
    id: 'proj_2',
    clientId: 'user_client_1',
    title: 'تصميم هوية بصرية كاملة ودليل إرشادي لعلامة تجارية سودانية',
    description: 'مطلوب مصمم هوية مبدع لتصميم الشعار، لوحة الألوان، الخطوط، وتطبيقات الهوية على المطبوعات والوسائط الرقمية لشركة أغذية.',
    categoryId: 'graphic-design',
    budget: 280000,
    budgetMin: 250000,
    budgetMax: 300000,
    deadline: '2026-09-30',
    status: PROJECT_STATUS.OPEN,
    createdAt: '2026-08-28T14:30:00.000Z',
  },
  {
    id: 'proj_3',
    clientId: 'user_client_1',
    title: 'إنتاج سلسلة فيديوهات تسويقية (UGC) لمنصة تجارة إلكترونية',
    description: 'نحتاج إلى منشئ محتوى ومونتير لإنتاج 5 فيديوهات قصيرة جذابة للترويج لمنتجاتنا على تيك توك وإنستغرام ريلز.',
    categoryId: 'video-editing',
    budget: 350000,
    budgetMin: 300000,
    budgetMax: 400000,
    deadline: '2026-10-05',
    status: PROJECT_STATUS.IN_PROGRESS,
    createdAt: '2026-08-20T09:00:00.000Z',
  },
];

export const defaultProposals = [
  {
    id: 'prop_1',
    projectId: 'proj_3',
    freelancerId: 'user_freelancer_1',
    bidAmount: 320000,
    deliveryTime: 7,
    coverLetter: 'مرحباً، يسعدني تنفيذ هذه السلسلة التسويقية باحترافية عالية. قمت سابقاً بإنتاج أكثر من 40 فيديو UGC لمتاجر إلكترونية وحققت معدلات تحويل ممتازة.',
    status: PROPOSAL_STATUS.ACCEPTED,
    createdAt: '2026-08-21T10:15:00.000Z',
  },
  {
    id: 'prop_2',
    projectId: 'proj_1',
    freelancerId: 'user_freelancer_2',
    bidAmount: 430000,
    deliveryTime: 20,
    coverLetter: 'أمتلك خبرة واسعة في بناء وتطوير منصات الويب المتكاملة مع مراعاة أعلى معايير الأمان وتجربة المستخدم.',
    status: PROPOSAL_STATUS.PENDING,
    createdAt: '2026-08-26T16:00:00.000Z',
  },
];

export const defaultContracts = [
  {
    id: 'cont_1',
    projectId: 'proj_3',
    clientId: 'user_client_1',
    freelancerId: 'user_freelancer_1',
    agreedPrice: 320000,
    deliveryDate: '2026-09-10',
    status: CONTRACT_STATUS.ACTIVE,
    createdAt: '2026-08-22T12:00:00.000Z',
  },
];

export const defaultDeliverables = [
  {
    id: 'deliv_1',
    contractId: 'cont_1',
    notes: 'تم تسليم المسودة الأولى لـ 3 فيديوهات بدقة 4K مع المؤثرات الصوتية والموسيقى المرخصة. يرجى المراجعة وإبداء الملاحظات.',
    files: [
      { name: 'UGC_Promo_Video_01.mp4', size: '48.2 MB', url: '#' },
      { name: 'UGC_Promo_Video_02.mp4', size: '52.1 MB', url: '#' },
    ],
    status: 'Pending',
    createdAt: '2026-08-27T18:00:00.000Z',
  },
];

export const defaultPaymentRequests = [
  {
    id: 'pay_1',
    contractId: 'cont_1',
    amount: 320000,
    method: 'Bankak',
    transactionId: 'TX1892048921',
    screenshot: marketingAds,
    status: PAYMENT_STATUS.APPROVED,
    createdAt: '2026-08-22T13:00:00.000Z',
  },
];

export const defaultWithdrawalRequests = [
  {
    id: 'with_1',
    freelancerId: 'user_freelancer_2',
    amount: 150000,
    method: 'Bankak',
    accountDetails: 'رقم الحساب: 2849102 - باسم: عمر فاروق',
    status: WITHDRAWAL_STATUS.PAID,
    createdAt: '2026-08-15T11:00:00.000Z',
  },
];

export const defaultReviews = [
  {
    id: 'rev_1',
    contractId: 'cont_1',
    fromUserId: 'user_client_1',
    toUserId: 'user_freelancer_1',
    rating: 5,
    comment: 'عمل متميز وإتقان رائع في المونتاج وتسليم سريع جداً قبل الموعد المحدد. شكراً جزيلاً تسنيم!',
    createdAt: '2026-08-29T15:30:00.000Z',
  },
];

export const defaultReports = [
  {
    id: 'rep_1',
    contractId: 'cont_1',
    reporterId: 'user_client_1',
    reportedUserId: 'user_freelancer_1',
    reason: 'تأخر في تسليم الملاحظات',
    description: 'تم حل النزاع ودياً بعد التواصل مع الدعم الفني.',
    desiredResolution: 'تسريع التسليم النهائي',
    status: 'Resolved',
    adminDecision: 'تم تسليم المشروع بنجاح واعتماد المخرجات.',
    createdAt: '2026-08-28T09:00:00.000Z',
  },
];

export const defaultConversations = [
  {
    id: 'conv_1',
    participants: ['user_client_1', 'user_freelancer_1'],
    updatedAt: '2026-08-27T18:05:00.000Z',
  },
];

export const defaultMessages = [
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'user_freelancer_1',
    text: 'السلام عليكم أستاذ طارق، قمت برفع نماذج الفيديوهات الأولى في صفحة العقد لتراها.',
    createdAt: '2026-08-27T18:05:00.000Z',
    readBy: ['user_freelancer_1'],
  },
];

export const defaultNotifications = [
  {
    id: 'notif_1',
    userId: 'user_freelancer_1',
    type: 'proposal_accepted',
    message: 'تهانينا! تم قبول عرضك للمشروع "إنتاج سلسلة فيديوهات تسويقية".',
    link: '/contracts/cont_1',
    isRead: false,
    createdAt: '2026-08-22T12:00:00.000Z',
  },
  {
    id: 'notif_2',
    userId: 'user_client_1',
    type: 'work_submitted',
    message: 'قام المستقل بتسليم مخرجات عمل جديدة بانتظار مراجعتك.',
    link: '/contracts/cont_1',
    isRead: true,
    createdAt: '2026-08-27T18:00:00.000Z',
  },
];

export const defaultSettings = {
  commissionPercent: 10,
  minWithdrawalAmount: 25000,
  bankakAccountNumber: '1892048',
  bankakAccountName: 'سوداوورك للخدمات الإلكترونية المحدودة',
  fawryAccountNumber: '0912345678',
  withdrawalInstructions: 'يتم تحويل الأرباح خلال 24 ساعة عمل عبر تطبيق بنكك أو المحافظ الإلكترونية المعتمدة.',
  supportContact: {
    phone: '+249 912 345 678',
    email: 'support@sudawork.com',
    whatsapp: '+249 912 345 678',
  },
};
