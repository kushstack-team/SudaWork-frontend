import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AdminDashboard.css';
import { useAuth } from '../../context/auth';
import { usePlatform } from '../../context/platform';
import { api } from '../../services/api';
import useLoader from '../../hooks/useLoader';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { TileGridSkeleton } from '../../components/common/Skeleton/Skeleton';
import FilePicker from '../../components/FilePicker/FilePicker';
import { paymentMethodLabel } from '../../utils/formatters';
import {
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiAlertTriangle,
  FiBriefcase,
  FiSettings,
  FiTrendingUp,
  FiCheck,
  FiX,
  FiPlus,
  FiToggleRight,
  FiFileText,
  FiList,
  FiGrid,
  FiMessageSquare,
  FiMail
} from 'react-icons/fi';

// Modular Tab Components
import AdminLayout from './components/AdminLayout';
import AddAdminModal from './components/AddAdminModal';
import AdminOverviewTab from './components/AdminOverviewTab';
import AdminUsersTab from './components/AdminUsersTab';
import AdminEscrowTab from './components/AdminEscrowTab';
import AdminWithdrawalsTab from './components/AdminWithdrawalsTab';
import AdminChatTab from './components/AdminChatTab';
import AdminEmailTab from './components/AdminEmailTab';
import AdminDisputesTab from './components/AdminDisputesTab';
import AdminProjectsTab from './components/AdminProjectsTab';
import AdminSettingsTab from './components/AdminSettingsTab';
import AdminFeaturesTab from './components/AdminFeaturesTab';
import AdminContractsTab from './components/AdminContractsTab';
import AdminAuditTab from './components/AdminAuditTab';

const TABS = ['overview', 'users', 'escrow', 'withdrawals', 'chat', 'email', 'contracts', 'disputes', 'projects', 'features', 'audit', 'settings'];

// Title and description shown in the top bar for each section.
const SECTION_META = {
  overview: { title: 'نظرة عامة', subtitle: 'ملخص نشاط المنصة والعناصر التي تنتظر إجراءك.' },
  users: { title: 'المستخدمون', subtitle: 'حسابات العملاء والمستقلين والمديرين.' },
  projects: { title: 'المشاريع والتصنيفات', subtitle: 'مراجعة المشاريع الجديدة وإدارة التصنيفات والمهارات.' },
  contracts: { title: 'العقود', subtitle: 'متابعة عقود العمل وحالاتها.' },
  escrow: { title: 'تدقيق المدفوعات', subtitle: 'مطابقة إيداعات العملاء واعتمادها لتفعيل العقود.' },
  withdrawals: { title: 'سحب الأرباح', subtitle: 'اعتماد طلبات سحب المستقلين وتسجيل التحويل.' },
  email: { title: 'حملات البريد', subtitle: 'مراسلة العملاء بالبريد الإلكتروني، مثل دعوة من لم ينشر مشروعاً بعد.' },
  chat: { title: 'المحادثات', subtitle: 'التواصل مع المستخدمين وإشعارات تحويل الأرباح.' },
  disputes: { title: 'النزاعات والبلاغات', subtitle: 'مراجعة البلاغات وإصدار القرارات.' },
  features: { title: 'إدارة الميزات', subtitle: 'تفعيل ميزات المنصة لكل دور.' },
  audit: { title: 'سجل العمليات', subtitle: 'الإجراءات الإدارية والمالية المسجلة.' },
  settings: { title: 'إعدادات النظام', subtitle: 'العمولة وبيانات الدفع والتواصل وسياسات المنصة.' },
};
// Notification links use the API's tab names.
const TAB_ALIASES = { payments: 'escrow' };

const EMPTY_SETTINGS_FORM = {
  platformName: 'SudanWork Freelance Marketplace',
  commissionPercent: 10,
  bankName: '',
  accountName: '',
  accountNumber: '',
  phone: '',
  paymentNotes: '',
  withdrawalInstructions: '',
  contactEmail: '',
  contactPhone: '',
  termsAndConditions: '',
  privacyPolicy: '',
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { reload: reloadPlatform } = usePlatform();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = TAB_ALIASES[searchParams.get('tab')] || searchParams.get('tab');
  const activeTab = TABS.includes(requestedTab) ? requestedTab : 'overview';
  const setActiveTab = (tab) => setSearchParams(tab === 'overview' ? {} : { tab });

  // Section filters live in the URL (?tab=users&role=freelancer), so the
  // overview cards, links and the back button all land on the same view.
  const linkTo = (tab, params = {}) => {
    const query = new URLSearchParams(tab === 'overview' ? params : { tab, ...params }).toString();
    return { pathname: '/admin', search: query ? `?${query}` : '' };
  };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };
  const userRoleFilter = searchParams.get('role') || 'all';
  const userStatusFilter = searchParams.get('status') || 'all';
  const contractStatusFilter = activeTab === 'contracts' ? searchParams.get('status') || '' : '';
  const projectStatusFilter = activeTab === 'projects' ? searchParams.get('status') || 'all' : 'all';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Core entities state
  const [metrics, setMetrics] = useState(null);
  const [usersPage, setUsersPage] = useState({ items: [], total: 0 });
  const [projectsList, setProjectsList] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [disputesList, setDisputesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [features, setFeatures] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [auditPage, setAuditPage] = useState({ data: [], total: 0, page: 1, totalPages: 1 });

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [contractCancelTarget, setContractCancelTarget] = useState(null);
  const [contractCancelReason, setContractCancelReason] = useState('');
  const [projectRejectTarget, setProjectRejectTarget] = useState(null);
  const [projectRejectReason, setProjectRejectReason] = useState('');
  const [reviewingProjectId, setReviewingProjectId] = useState(null);

  // Filtering & Search (users are filtered on the server)
  const [userSearch, setUserSearch] = useState('');
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Modals & Action States
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputeResolutionNotes, setDisputeResolutionNotes] = useState('');
  const [disputeNewStatus, setDisputeNewStatus] = useState('Resolved');
  const [disputeAction, setDisputeAction] = useState('none');
  const [submittingDisputeResolution, setSubmittingDisputeResolution] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingPaymentAction, setSubmittingPaymentAction] = useState(false);

  const [payoutTarget, setPayoutTarget] = useState(null);
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutProof, setPayoutProof] = useState([]);
  const [supportUnread, setSupportUnread] = useState(0);
  const [withdrawalRejectTarget, setWithdrawalRejectTarget] = useState(null);
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState('');
  const [submittingWithdrawalAction, setSubmittingWithdrawalAction] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [settingsForm, setSettingsForm] = useState(EMPTY_SETTINGS_FORM);
  const [savingSettings, setSavingSettings] = useState(false);

  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning',
    onConfirm: null
  });
  const closeConfirm = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  const showSuccess = (msg) => {
    setFeedbackError('');
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(''), 5000);
  };

  const showError = (msg) => {
    setFeedbackSuccess('');
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(''), 7000);
  };

  const loadAllAdminData = useCallback(async () => {
    try {
      const [dash, projs, pending, pays, withs, disps, cats, setts, feats, skills] = await Promise.all([
        api.admin.dashboard(),
        api.admin.projects({ limit: 50 }),
        // Review queue is loaded on its own so it is never cut off by the page above (oldest first).
        api.admin.projects({ status: 'PENDING_REVIEW', limit: 100 }),
        api.admin.payments({ limit: 50 }),
        api.admin.withdrawals({ limit: 50 }),
        api.admin.reports({ limit: 50 }),
        api.admin.categories(),
        api.admin.settings(),
        api.admin.features(),
        api.admin.skills(),
      ]);
      setSkillsList(skills);
      setMetrics(dash);
      setProjectsList(projs.items);
      setPendingProjects(pending.items);
      setPaymentRequests(pays.items);
      setWithdrawalRequests(withs.items);
      setDisputesList(disps.items);
      setCategoriesList(cats);
      setFeatures(feats);
      setSettingsForm({
        platformName: setts.platform_name || 'SudanWork Freelance Marketplace',
        commissionPercent: setts.commission_percentage ?? 10,
        bankName: setts.payment_instructions?.bankName || '',
        accountName: setts.payment_instructions?.accountName || '',
        accountNumber: setts.payment_instructions?.accountNumber || '',
        phone: setts.payment_instructions?.phone || '',
        paymentNotes: setts.payment_instructions?.notes || '',
        withdrawalInstructions: setts.withdrawal_instructions || '',
        contactEmail: setts.contact_info?.email || '',
        contactPhone: setts.contact_info?.phone || '',
        termsAndConditions: setts.terms_and_conditions || '',
        privacyPolicy: setts.privacy_policy || '',
      });
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useLoader(loadAllAdminData, []);

  // Unread support messages (sidebar badge); refreshed while the dashboard is open.
  useEffect(() => {
    const load = () => api.admin.supportUnreadCount().then(setSupportUnread, () => {});
    const first = setTimeout(load, 0);
    const timer = setInterval(() => !document.hidden && load(), 30000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  // Users: server-side search, debounced while typing.
  const loadUsers = useCallback(async (search, role, status) => {
    try {
      setUsersPage(await api.admin.users({ search, role, status: status === 'all' ? undefined : status, limit: 100 }));
    } catch (err) {
      showError(err.message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(userSearch.trim(), userRoleFilter, userStatusFilter), 300);
    return () => clearTimeout(timer);
  }, [userSearch, userRoleFilter, userStatusFilter, loadUsers]);

  const loadUnreadNotifications = useCallback(() => {
    api.notifications.unreadCount().then(setUnreadNotifications, () => {});
  }, []);
  useLoader(loadUnreadNotifications, []);

  // Contracts and audit log load on their own filters/pages.
  const loadContracts = useCallback(async (status) => {
    try {
      setContractsList((await api.admin.contracts({ status, limit: 100 })).items);
    } catch (err) {
      showError(err.message);
    }
  }, []);

  const loadAudit = useCallback(async (page) => {
    try {
      setAuditPage(await api.admin.auditLogs({ page, limit: 30 }));
    } catch (err) {
      showError(err.message);
    }
  }, []);

  useLoader(() => loadContracts(contractStatusFilter), [contractStatusFilter], activeTab === 'contracts');
  useLoader(() => loadAudit(1), [], activeTab === 'audit');

  const refreshAll = () => {
    loadAllAdminData();
    loadUsers(userSearch.trim(), userRoleFilter, userStatusFilter);
    loadUnreadNotifications();
    if (activeTab === 'contracts') loadContracts(contractStatusFilter);
    if (activeTab === 'audit') loadAudit(auditPage.page);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const ok = await runAction(
      () => api.admin.createSkill({ name: newSkillName.trim(), categoryId: newSkillCategory || null }),
      'تمت إضافة المهارة.'
    );
    if (ok) {
      setNewSkillName('');
      setNewSkillCategory('');
      setIsSkillModalOpen(false);
    }
  };

  const handleToggleSkill = (skill) => {
    runAction(
      () => api.admin.updateSkill(skill.id, { isActive: !skill.isActive }),
      skill.isActive ? 'تم إخفاء المهارة.' : 'تمت إعادة تفعيل المهارة.'
    );
  };

  const handleCancelContract = async (e) => {
    e.preventDefault();
    if (!contractCancelTarget || contractCancelReason.trim().length < 3) return;
    const ok = await runAction(
      () => api.admin.cancelContract(contractCancelTarget.id, contractCancelReason.trim()),
      'تم إلغاء العقد وإبلاغ الطرفين.'
    );
    if (ok) {
      setContractCancelTarget(null);
      setContractCancelReason('');
    }
  };

  // Runs an admin action, reports the real outcome, then refreshes.
  const runAction = async (fn, successMsg) => {
    try {
      await fn();
      showSuccess(successMsg);
      refreshAll();
      return true;
    } catch (err) {
      showError(err.message);
      return false;
    }
  };

  // 1. User Management Actions
  const handleToggleUserStatus = (targetUser) => {
    const suspend = targetUser.status === 'active';
    const actionText = suspend ? 'تجميد حساب' : 'تفعيل حساب';
    setConfirmModal({
      isOpen: true,
      title: actionText,
      message: suspend
        ? `هل أنت متأكد من تجميد حساب ${targetUser.fullName}؟ سيتم تسجيل خروجه من جميع الأجهزة.`
        : `هل أنت متأكد من إعادة تفعيل حساب ${targetUser.fullName}؟`,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
      type: suspend ? 'danger' : 'success',
      onConfirm: () => {
        closeConfirm();
        runAction(
          () => (suspend ? api.admin.suspendUser(targetUser.id) : api.admin.activateUser(targetUser.id)),
          `تم ${suspend ? 'تعليق' : 'تنشيط'} حساب ${targetUser.fullName} بنجاح.`
        );
      }
    });
  };

  const handleToggleVerified = (targetUser) => {
    const verify = !targetUser.isVerified;
    setConfirmModal({
      isOpen: true,
      title: verify ? 'توثيق الحساب' : 'إزالة التوثيق',
      message: verify
        ? `منح ${targetUser.fullName} علامة "موثق"؟ ستظهر العلامة على ملفه العام، فامنحها للحسابات الموثوقة فقط.`
        : `إزالة علامة التوثيق من حساب ${targetUser.fullName}؟`,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
      type: verify ? 'success' : 'warning',
      onConfirm: () => {
        closeConfirm();
        runAction(
          () => (verify ? api.admin.verifyUser(targetUser.id) : api.admin.unverifyUser(targetUser.id)),
          verify ? `تم توثيق حساب ${targetUser.fullName}.` : `تمت إزالة التوثيق من حساب ${targetUser.fullName}.`
        );
      }
    });
  };

  const handleDeleteUser = (targetUser) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف حساب المستخدم نهائياً',
      message: `هل أنت متأكد من حذف حساب "${targetUser.fullName}" نهائياً من المنصة؟ هذا الإجراء لا يمكن التراجع عنه.`,
      confirmText: 'حذف نهائي',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {
        closeConfirm();
        runAction(
          () => api.admin.deleteUser(targetUser.id),
          `تم حذف حساب ${targetUser.fullName} بنجاح.`
        );
      }
    });
  };

  // 2. Manual payment verification
  const handleApprovePayment = (payReq) => {
    setConfirmModal({
      isOpen: true,
      title: 'اعتماد الدفعة وبدء العقد',
      message: `تأكيد استلام تحويل بمبلغ ${Number(payReq.amount || 0).toLocaleString()} ج.س (المرجع: ${payReq.transactionId}) وبدء العقد؟`,
      confirmText: 'اعتماد وتفعيل',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: async () => {
        closeConfirm();
        setSubmittingPaymentAction(true);
        await runAction(() => api.admin.approvePayment(payReq.id), 'تم اعتماد الدفعة وتفعيل العقد المرتبط بنجاح!');
        setSubmittingPaymentAction(false);
      }
    });
  };

  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment || rejectionReason.trim().length < 3) return;
    setSubmittingPaymentAction(true);
    const ok = await runAction(
      () => api.admin.rejectPayment(selectedPayment.id, rejectionReason.trim()),
      'تم رفض إثبات الدفع وإبلاغ العميل بالسبب.'
    );
    if (ok) {
      setSelectedPayment(null);
      setRejectionReason('');
    }
    setSubmittingPaymentAction(false);
  };

  const handleViewProof = async (payReq) => {
    try {
      await api.uploads.open(payReq.proof);
    } catch (err) {
      showError(err.message);
    }
  };

  // 3. Withdrawals: transfer the money, then record it with the reference and
  // the transfer notice (approves a pending request in the same step). The
  // notice goes to the freelancer's support chat to confirm receipt.
  const openPayout = (wReq) => {
    setPayoutReference('');
    setPayoutNote('');
    setPayoutProof([]);
    setPayoutTarget(wReq);
  };

  const payoutProofFile = payoutProof.find((f) => f.status === 'done' && f.upload);
  const payoutUploading = payoutProof.some((f) => f.status === 'uploading');

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    if (!payoutTarget || payoutReference.trim().length < 3 || !payoutProofFile) return;
    setSubmittingWithdrawalAction(true);
    const ok = await runAction(
      () => api.admin.markWithdrawalPaid(payoutTarget.id, {
        transactionReference: payoutReference.trim(),
        note: payoutNote.trim(),
        proofFileId: payoutProofFile.upload.id,
      }),
      'تم تسجيل التحويل وإرسال إشعار التحويل إلى المستقل في المحادثات.'
    );
    if (ok) {
      setPayoutTarget(null);
      setPayoutReference('');
      setPayoutNote('');
      setPayoutProof([]);
    }
    setSubmittingWithdrawalAction(false);
  };

  const openSupportChat = (conversationId) => {
    setSearchParams(conversationId ? { tab: 'chat', conversationId } : { tab: 'chat' });
  };

  const handleMessageUser = async (targetUser) => {
    try {
      const conversation = await api.admin.startSupportConversation(targetUser.id);
      openSupportChat(conversation.id);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRejectWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawalRejectTarget || withdrawalRejectReason.trim().length < 3) return;
    setSubmittingWithdrawalAction(true);
    const ok = await runAction(
      () => api.admin.rejectWithdrawal(withdrawalRejectTarget.id, withdrawalRejectReason.trim()),
      'تم رفض طلب السحب وإعادة المبلغ لرصيد المستقل.'
    );
    if (ok) {
      setWithdrawalRejectTarget(null);
      setWithdrawalRejectReason('');
    }
    setSubmittingWithdrawalAction(false);
  };

  // 4. Dispute Resolution Handler
  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setSubmittingDisputeResolution(true);
    const ok = disputeNewStatus === 'In Review'
      ? await runAction(() => api.admin.reviewReport(selectedDispute.id), 'تم تحويل البلاغ إلى قيد المراجعة.')
      : await runAction(
          () => api.admin.resolveReport(selectedDispute.id, { resolution: disputeResolutionNotes.trim(), action: disputeAction }),
          'تم تسجيل قرار التحكيم وإبلاغ الأطراف.'
        );
    if (ok) {
      setSelectedDispute(null);
      setDisputeResolutionNotes('');
    }
    setSubmittingDisputeResolution(false);
  };

  const handleDeleteReport = (disp) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف البلاغ نهائياً',
      message: `هل أنت متأكد من حذف البلاغ #${disp.id.slice(0, 8)} (${disp.reason}) نهائياً؟ سيتم الاحتفاظ بنسخة منه في سجل العمليات، ولا يمكن التراجع عن الحذف.`,
      confirmText: 'حذف البلاغ',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {
        closeConfirm();
        runAction(() => api.admin.deleteReport(disp.id), 'تم حذف البلاغ بنجاح.');
      }
    });
  };

  // 5. Category Management Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const ok = await runAction(() => api.admin.createCategory({ name: newCategoryName.trim() }), 'تمت إضافة التصنيف المهني بنجاح.');
    if (ok) {
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  const handleDeleteCategory = (catId) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف التصنيف',
      message: 'هل أنت متأكد من حذف هذا التصنيف؟ إذا كانت هناك مشاريع مرتبطة به فسيتم إخفاؤه بدلاً من حذفه.',
      confirmText: 'حذف التصنيف',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {
        closeConfirm();
        runAction(() => api.admin.deleteCategory(catId), 'تم تحديث التصنيفات بنجاح.');
      }
    });
  };

  const handleModerateProject = (proj) => {
    setConfirmModal({
      isOpen: true,
      title: 'إيقاف المشروع',
      message: `إيقاف مشروع "${proj.title}" وإزالته من سوق المشاريع؟ سيتم رفض العروض المعلقة وإبلاغ العميل.`,
      confirmText: 'إيقاف المشروع',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {
        closeConfirm();
        runAction(() => api.admin.moderateProject(proj.id, { status: 'CANCELLED' }), 'تم إيقاف المشروع.');
      }
    });
  };

  // Project moderation: approve publishes the project, reject returns it to the client with a reason.
  const handleApproveProject = (proj) => {
    setConfirmModal({
      isOpen: true,
      title: 'الموافقة على نشر المشروع',
      message: `نشر مشروع "${proj.title}" في سوق المشاريع ليبدأ المستقلون بتقديم العروض؟ سيتم إبلاغ العميل.`,
      confirmText: 'موافقة ونشر',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: async () => {
        closeConfirm();
        setReviewingProjectId(proj.id);
        await runAction(() => api.admin.approveProject(proj.id), 'تمت الموافقة على المشروع ونشره.');
        setReviewingProjectId(null);
      }
    });
  };

  const handleRejectProject = async (e) => {
    e.preventDefault();
    if (!projectRejectTarget || projectRejectReason.trim().length < 3) return;
    setReviewingProjectId(projectRejectTarget.id);
    const ok = await runAction(
      () => api.admin.rejectProject(projectRejectTarget.id, projectRejectReason.trim()),
      'تم رفض المشروع وإبلاغ العميل بالسبب.'
    );
    if (ok) {
      setProjectRejectTarget(null);
      setProjectRejectReason('');
    }
    setReviewingProjectId(null);
  };

  const handleDeleteProject = (proj) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف المشروع نهائياً',
      message: `هل أنت متأكد من حذف مشروع "${proj.title}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'حذف المشروع',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {
        closeConfirm();
        runAction(() => api.admin.deleteProject(proj.id), 'تم حذف المشروع نهائياً.');
      }
    });
  };

  const handleCloseProject = (proj) => {
    setConfirmModal({
      isOpen: true,
      title: 'إغلاق المشروع',
      message: `هل أنت متأكد من إغلاق مشروع "${proj.title}"؟ سيتم إيقاف استقبال العروض الجديدة.`,
      confirmText: 'إغلاق المشروع',
      cancelText: 'إلغاء',
      type: 'warning',
      onConfirm: () => {
        closeConfirm();
        runAction(() => api.admin.moderateProject(proj.id, { status: 'CANCELLED' }), 'تم إغلاق المشروع بنجاح.');
      }
    });
  };

  // 6. Platform Settings Update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const ok = await runAction(
      () =>
        api.admin.saveSettings({
          platform_name: (settingsForm.platformName || '').trim(),
          commission_percentage: Number(settingsForm.commissionPercent),
          payment_instructions: {
            bankName: (settingsForm.bankName || '').trim(),
            accountName: (settingsForm.accountName || '').trim(),
            accountNumber: (settingsForm.accountNumber || '').trim(),
            phone: (settingsForm.phone || '').trim(),
            notes: (settingsForm.paymentNotes || '').trim(),
          },
          withdrawal_instructions: (settingsForm.withdrawalInstructions || '').trim(),
          contact_info: {
            email: (settingsForm.contactEmail || '').trim(),
            phone: (settingsForm.contactPhone || '').trim(),
          },
          terms_and_conditions: (settingsForm.termsAndConditions || '').trim(),
          privacy_policy: (settingsForm.privacyPolicy || '').trim(),
        }),
      'تم حفظ إعدادات المنصة وتعليمات التحويل البنكي بنجاح.'
    );
    if (ok) reloadPlatform();
    setSavingSettings(false);
  };

  // 7. Feature availability
  const handleFeatureChange = async (feature, changes) => {
    try {
      const updated = await api.admin.updateFeature(feature.id, changes);
      setFeatures(updated);
      reloadPlatform();
      return true;
    } catch (err) {
      showError(err.message);
      return false;
    }
  };

  // Pending counts for the sidebar badges (from the server).
  const pendingPaymentsCount = metrics?.payments?.pending ?? 0;
  const pendingWithdrawalsCount = (metrics?.withdrawals?.pending ?? 0) + (metrics?.withdrawals?.approved ?? 0);
  const openDisputesCount = metrics?.reports?.open ?? 0;
  const pendingProjectsCount = metrics?.projects?.pendingReview ?? pendingProjects.length;
  const filteredUsers = usersPage.items;

  const sidebarGroups = [
    {
      label: 'الرئيسية',
      items: [{ id: 'overview', label: 'نظرة عامة', icon: FiGrid }],
    },
    {
      label: 'الإدارة',
      items: [
        { id: 'users', label: 'المستخدمون', icon: FiUsers },
        { id: 'projects', label: 'المشاريع والتصنيفات', icon: FiBriefcase, badge: pendingProjectsCount },
        { id: 'contracts', label: 'العقود', icon: FiFileText },
      ],
    },
    {
      label: 'المالية',
      items: [
        { id: 'escrow', label: 'تدقيق المدفوعات', icon: FiDollarSign, badge: pendingPaymentsCount },
        { id: 'withdrawals', label: 'سحب الأرباح', icon: FiTrendingUp, badge: pendingWithdrawalsCount },
      ],
    },
    {
      label: 'التواصل',
      items: [
        { id: 'chat', label: 'المحادثات', icon: FiMessageSquare, badge: supportUnread },
        { id: 'email', label: 'حملات البريد', icon: FiMail },
      ],
    },
    {
      label: 'الإشراف',
      items: [{ id: 'disputes', label: 'النزاعات والبلاغات', icon: FiAlertTriangle, badge: openDisputesCount }],
    },
    {
      label: 'النظام',
      items: [
        { id: 'features', label: 'إدارة الميزات', icon: FiToggleRight },
        { id: 'audit', label: 'سجل العمليات', icon: FiList },
        { id: 'settings', label: 'إعدادات النظام', icon: FiSettings },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate('/login', { replace: true });
  };

  const handleCreateAdmin = async (data) => {
    const admin = await api.admin.createAdmin(data);
    setAddAdminOpen(false);
    showSuccess(`تمت إضافة ${admin.fullName} كمدير للمنصة.`);
    refreshAll();
  };

  const section = SECTION_META[activeTab];

  return (
    <>
      <AdminLayout
        groups={sidebarGroups}
        activeId={activeTab}
        onNavigate={setActiveTab}
        title={section.title}
        subtitle={section.subtitle}
        user={user}
        unreadNotifications={unreadNotifications}
        onRefresh={refreshAll}
        onLogout={handleLogout}
      >
          {/* Feedback Alerts */}
          {feedbackSuccess && (
            <div className="admin-alert success" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{feedbackSuccess}</span>
            </div>
          )}
          {feedbackError && (
            <div className="admin-alert error" role="alert">
              <FiAlertTriangle className="alert-icon" />
              <span>{feedbackError}</span>
            </div>
          )}

          {loadError && (
            <ErrorState title="تعذر تحميل بيانات الإدارة" error={loadError} onRetry={() => { setLoading(true); loadAllAdminData(); }} />
          )}

          {loading && <TileGridSkeleton count={8} label="جارٍ تحميل بيانات لوحة الإدارة..." />}

          {!loading && activeTab === 'overview' && (
            <AdminOverviewTab metrics={metrics} linkTo={linkTo} />
          )}

          {!loading && activeTab === 'users' && (
            <AdminUsersTab
              filteredUsers={filteredUsers}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={(role) => setFilter('role', role)}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={(status) => setFilter('status', status)}
              onAddAdmin={() => setAddAdminOpen(true)}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onToggleVerified={handleToggleVerified}
              onMessageUser={handleMessageUser}
              currentUserId={user?.id}
            />
          )}

          {!loading && activeTab === 'escrow' && (
            <AdminEscrowTab
              paymentRequests={paymentRequests}
              submittingPaymentAction={submittingPaymentAction}
              onApprovePayment={handleApprovePayment}
              onSelectRejectPayment={(pay) => {
                setRejectionReason('');
                setSelectedPayment(pay);
              }}
              onViewProof={handleViewProof}
            />
          )}

          {!loading && activeTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              withdrawalRequests={withdrawalRequests}
              onPayout={openPayout}
              onOpenChat={openSupportChat}
              onRejectWithdrawal={(w) => {
                setWithdrawalRejectReason('');
                setWithdrawalRejectTarget(w);
              }}
            />
          )}

          {activeTab === 'chat' && <AdminChatTab onUnreadChange={setSupportUnread} />}

          {activeTab === 'email' && <AdminEmailTab onSuccess={showSuccess} onError={showError} />}

          {!loading && activeTab === 'contracts' && (
            <AdminContractsTab
              contracts={contractsList}
              statusFilter={contractStatusFilter}
              setStatusFilter={(status) => setFilter('status', status)}
              onCancelContract={(c) => {
                setContractCancelReason('');
                setContractCancelTarget(c);
              }}
            />
          )}

          {!loading && activeTab === 'audit' && (
            <AdminAuditTab
              logs={auditPage.data}
              total={auditPage.total}
              page={auditPage.page}
              totalPages={auditPage.totalPages}
              onPageChange={loadAudit}
            />
          )}

          {!loading && activeTab === 'disputes' && (
            <AdminDisputesTab
              disputesList={disputesList}
              onOpenResolveDispute={(disp) => {
                setSelectedDispute(disp);
                setDisputeNewStatus(disp.status === 'Open' ? 'In Review' : 'Resolved');
                setDisputeAction('none');
                setDisputeResolutionNotes(disp.resolutionNotes || '');
              }}
              onDeleteReport={handleDeleteReport}
            />
          )}

          {!loading && activeTab === 'projects' && (
            <AdminProjectsTab
              statusFilter={projectStatusFilter}
              setStatusFilter={(status) => setFilter('status', status)}
              categoriesList={categoriesList}
              projectsList={projectsList}
              onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
              onDeleteCategory={handleDeleteCategory}
              onModerateProject={handleModerateProject}
              onDeleteProject={handleDeleteProject}
              onCloseProject={handleCloseProject}
              pendingProjects={pendingProjects}
              onApproveProject={handleApproveProject}
              onRejectProject={(proj) => {
                setProjectRejectReason('');
                setProjectRejectTarget(proj);
              }}
              reviewingId={reviewingProjectId}
              skillsList={skillsList}
              onOpenSkillModal={() => setIsSkillModalOpen(true)}
              onToggleSkill={handleToggleSkill}
            />
          )}

          {!loading && activeTab === 'features' && (
            <AdminFeaturesTab features={features} onChange={handleFeatureChange} />
          )}

          {!loading && activeTab === 'settings' && (
            <AdminSettingsTab
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              onSaveSettings={handleSaveSettings}
              saving={savingSettings}
            />
          )}

      </AdminLayout>

      {/* Dispute Mediation Decision Modal */}
      {selectedDispute && (
        <div className="admin-modal-backdrop" onClick={() => !submittingDisputeResolution && setSelectedDispute(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>قرار بخصوص البلاغ #{selectedDispute.id.slice(0, 8)}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedDispute(null)}
                disabled={submittingDisputeResolution}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleResolveDispute} className="modal-form">
              <div className="dispute-summary-preview">
                <p><strong>سبب النزاع:</strong> {selectedDispute.reason}</p>
                <p><strong>شكوى المدعي ({selectedDispute.reporterName}):</strong> {selectedDispute.description}</p>
                {selectedDispute.reportedUserName && <p><strong>الطرف الآخر:</strong> {selectedDispute.reportedUserName}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dispute-status">الإجراء:</label>
                <select
                  id="dispute-status"
                  className="modal-select"
                  value={disputeNewStatus}
                  onChange={(e) => setDisputeNewStatus(e.target.value)}
                >
                  {selectedDispute.status === 'Open' && <option value="In Review">تحويل إلى قيد المراجعة</option>}
                  <option value="Resolved">إصدار القرار وإغلاق البلاغ</option>
                </select>
              </div>

              {disputeNewStatus === 'Resolved' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dispute-action">إجراء إداري مرافق للقرار:</label>
                    <select
                      id="dispute-action"
                      className="modal-select"
                      value={disputeAction}
                      onChange={(e) => setDisputeAction(e.target.value)}
                    >
                      <option value="none">بدون إجراء إضافي</option>
                      <option value="warning">توجيه تحذير</option>
                      {selectedDispute.reportedUserId && <option value="suspend_user">تعليق حساب الطرف المشكو في حقه</option>}
                      {selectedDispute.targetType === 'contract' && <option value="cancel_contract">إلغاء العقد</option>}
                      {selectedDispute.targetType === 'project' && <option value="close_project">إيقاف المشروع</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="dispute-notes">
                      نص القرار وتوجيهات الإدارة <span className="required">*</span>
                    </label>
                    <textarea
                      id="dispute-notes"
                      rows="4"
                      className="modal-textarea"
                      placeholder="اكتب القرار الملزم، مثل: يُعاد العمل للتعديل خلال 3 أيام، أو يُرد المبلغ للعميل..."
                      value={disputeResolutionNotes}
                      onChange={(e) => setDisputeResolutionNotes(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingDisputeResolution || (disputeNewStatus === 'Resolved' && disputeResolutionNotes.trim().length < 3)}
                >
                  <FiCheck />
                  <span>{submittingDisputeResolution ? 'جارٍ التسجيل...' : 'تأكيد'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingDisputeResolution}
                  onClick={() => setSelectedDispute(null)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Rejection Modal */}
      {selectedPayment && (
        <div className="admin-modal-backdrop" onClick={() => !submittingPaymentAction && setSelectedPayment(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>رفض إثبات الدفع ({selectedPayment.transactionId})</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedPayment(null)}
                disabled={submittingPaymentAction}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleRejectPayment} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="rejection-reason">سبب الرفض (سيظهر للعميل):</label>
                <textarea
                  id="rejection-reason"
                  rows="3"
                  className="modal-textarea"
                  placeholder="مثال: رقم العملية غير مطابق لكشف الحساب، يرجى إعادة التحويل وإرفاق إشعار صحيح..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-danger-btn"
                  disabled={submittingPaymentAction || rejectionReason.trim().length < 3}
                >
                  <FiX />
                  <span>{submittingPaymentAction ? 'جارٍ الرفض...' : 'تأكيد الرفض'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingPaymentAction}
                  onClick={() => setSelectedPayment(null)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal: reference + transfer notice, sent to the freelancer's chat */}
      {payoutTarget && (
        <div className="admin-modal-backdrop" onClick={() => !submittingWithdrawalAction && setPayoutTarget(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="payout-title">
            <div className="modal-header">
              <h3 id="payout-title">تحويل أرباح {payoutTarget.freelancerName}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setPayoutTarget(null)} disabled={submittingWithdrawalAction} aria-label="إغلاق">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleMarkPaid} className="modal-form">
              <div className="dispute-summary-preview">
                <p><strong>المبلغ:</strong> {Number(payoutTarget.amount).toLocaleString('en-US')} ج.س</p>
                <p><strong>الطريقة:</strong> {paymentMethodLabel(payoutTarget.method)}</p>
                <p><strong>الحساب:</strong> {payoutTarget.accountNumber} — {payoutTarget.accountName}</p>
              </div>
              <p className="input-hint payout-steps-hint">
                حوّل المبلغ أولاً إلى حساب المستقل، ثم أدخل رقم العملية وأرفق صورة إشعار التحويل.
                سيصل الإشعار إلى المستقل في المحادثات ليؤكد الاستلام.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="payout-ref">
                  رقم عملية التحويل <span className="required">*</span>
                </label>
                <input
                  id="payout-ref"
                  type="text"
                  className="modal-input"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  placeholder="مثال: 29384756"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="payout-proof">
                  صورة إشعار التحويل <span className="required">*</span>
                </label>
                <FilePicker
                  id="payout-proof"
                  purpose="payout_proof"
                  accept=".png,.jpg,.jpeg,.pdf"
                  files={payoutProof}
                  onChange={setPayoutProof}
                  disabled={submittingWithdrawalAction}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="payout-note">رسالة للمستقل (اختياري)</label>
                <input
                  id="payout-note"
                  type="text"
                  className="modal-input"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="مثال: قد يستغرق ظهور المبلغ ساعة واحدة."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingWithdrawalAction || payoutUploading || payoutReference.trim().length < 3 || !payoutProofFile}
                >
                  <FiCheck />
                  <span>{submittingWithdrawalAction ? 'جارٍ الإرسال...' : payoutUploading ? 'جارٍ رفع الصورة...' : 'تأكيد التحويل وإرسال الإشعار'}</span>
                </button>
                <button type="button" className="modal-secondary-btn" disabled={submittingWithdrawalAction} onClick={() => setPayoutTarget(null)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Rejection Modal */}
      {withdrawalRejectTarget && (
        <div className="admin-modal-backdrop" onClick={() => !submittingWithdrawalAction && setWithdrawalRejectTarget(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>رفض طلب السحب</h3>
              <button type="button" className="modal-close-btn" onClick={() => setWithdrawalRejectTarget(null)} disabled={submittingWithdrawalAction}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleRejectWithdrawal} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="withdrawal-reject-reason">سبب الرفض (سيظهر للمستقل):</label>
                <textarea
                  id="withdrawal-reject-reason"
                  rows="3"
                  className="modal-textarea"
                  value={withdrawalRejectReason}
                  onChange={(e) => setWithdrawalRejectReason(e.target.value)}
                  placeholder="مثال: رقم الحساب غير صحيح، يرجى تقديم طلب جديد ببيانات صحيحة."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-danger-btn" disabled={submittingWithdrawalAction || withdrawalRejectReason.trim().length < 3}>
                  <FiX />
                  <span>{submittingWithdrawalAction ? 'جارٍ الرفض...' : 'تأكيد الرفض'}</span>
                </button>
                <button type="button" className="modal-secondary-btn" disabled={submittingWithdrawalAction} onClick={() => setWithdrawalRejectTarget(null)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Rejection Modal */}
      {projectRejectTarget && (
        <div className="admin-modal-backdrop" onClick={() => !reviewingProjectId && setProjectRejectTarget(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>رفض نشر المشروع: {projectRejectTarget.title}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setProjectRejectTarget(null)} disabled={Boolean(reviewingProjectId)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleRejectProject} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="project-reject-reason">سبب الرفض (سيظهر للعميل):</label>
                <textarea
                  id="project-reject-reason"
                  rows="3"
                  className="modal-textarea"
                  value={projectRejectReason}
                  onChange={(e) => setProjectRejectReason(e.target.value)}
                  placeholder="مثال: وصف المشروع غير كافٍ، يرجى توضيح المطلوب بالتفصيل."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-danger-btn" disabled={Boolean(reviewingProjectId) || projectRejectReason.trim().length < 3}>
                  <FiX />
                  <span>{reviewingProjectId ? 'جارٍ الرفض...' : 'تأكيد الرفض'}</span>
                </button>
                <button type="button" className="modal-secondary-btn" disabled={Boolean(reviewingProjectId)} onClick={() => setProjectRejectTarget(null)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsSkillModalOpen(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>إضافة مهارة جديدة</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsSkillModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="new-skill-name">اسم المهارة:</label>
                <input id="new-skill-name" type="text" className="modal-input" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-skill-category">التصنيف (اختياري):</label>
                <select id="new-skill-category" className="modal-select" value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)}>
                  <option value="">بدون تصنيف</option>
                  {categoriesList.filter((c) => c.isActive).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-primary-btn" disabled={!newSkillName.trim()}>
                  <FiPlus />
                  <span>إضافة المهارة</span>
                </button>
                <button type="button" className="modal-secondary-btn" onClick={() => setIsSkillModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Contract Cancellation Modal */}
      {contractCancelTarget && (
        <div className="admin-modal-backdrop" onClick={() => setContractCancelTarget(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>إلغاء عقد: {contractCancelTarget.projectTitle}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setContractCancelTarget(null)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCancelContract} className="modal-form">
              <div className="dispute-summary-preview">
                <p>سيتم إلغاء العقد وإغلاق المشروع وإبلاغ الطرفين. أي مبالغ مدفوعة تُعاد يدوياً خارج المنصة.</p>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contract-cancel-reason">سبب الإلغاء (يظهر للطرفين):</label>
                <textarea id="contract-cancel-reason" rows="3" className="modal-textarea" value={contractCancelReason} onChange={(e) => setContractCancelReason(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-danger-btn" disabled={contractCancelReason.trim().length < 3}>
                  <FiX />
                  <span>تأكيد الإلغاء</span>
                </button>
                <button type="button" className="modal-secondary-btn" onClick={() => setContractCancelTarget(null)}>تراجع</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Category Modal */}
      {isCategoryModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>إضافة تصنيف مهني جديد</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="new-cat-name">اسم التصنيف الجديد:</label>
                <input
                  id="new-cat-name"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: الأمن السيبراني وحماية البيانات"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={!newCategoryName.trim()}
                >
                  <FiPlus />
                  <span>إضافة التصنيف</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      <AddAdminModal
        isOpen={addAdminOpen}
        onSubmit={handleCreateAdmin}
        onClose={() => setAddAdminOpen(false)}
      />
    </>
  );
};

export default AdminDashboard;
