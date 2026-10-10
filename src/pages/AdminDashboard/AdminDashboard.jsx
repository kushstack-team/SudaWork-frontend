import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './AdminDashboard.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { usePlatform } from '../../context/platform';
import { api } from '../../services/api';
import useLoader from '../../hooks/useLoader';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import {
  FiShield,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiAlertTriangle,
  FiBriefcase,
  FiSettings,
  FiTrendingUp,
  FiActivity,
  FiCheck,
  FiX,
  FiPlus,
  FiToggleRight,
  FiFileText,
  FiList
} from 'react-icons/fi';

// Modular Tab Components
import AdminOverviewTab from './components/AdminOverviewTab';
import AdminUsersTab from './components/AdminUsersTab';
import AdminEscrowTab from './components/AdminEscrowTab';
import AdminWithdrawalsTab from './components/AdminWithdrawalsTab';
import AdminDisputesTab from './components/AdminDisputesTab';
import AdminProjectsTab from './components/AdminProjectsTab';
import AdminSettingsTab from './components/AdminSettingsTab';
import AdminFeaturesTab from './components/AdminFeaturesTab';
import AdminContractsTab from './components/AdminContractsTab';
import AdminAuditTab from './components/AdminAuditTab';

const TABS = ['overview', 'users', 'escrow', 'withdrawals', 'contracts', 'disputes', 'projects', 'features', 'audit', 'settings'];
// Notification links use the API's tab names.
const TAB_ALIASES = { payments: 'escrow' };

const EMPTY_SETTINGS_FORM = {
  commissionPercent: 10,
  bankName: '',
  accountName: '',
  accountNumber: '',
  phone: '',
  paymentNotes: '',
  withdrawalInstructions: '',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { reload: reloadPlatform } = usePlatform();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = TAB_ALIASES[searchParams.get('tab')] || searchParams.get('tab');
  const activeTab = TABS.includes(requestedTab) ? requestedTab : 'overview';
  const setActiveTab = (tab) => setSearchParams(tab === 'overview' ? {} : { tab });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Core entities state
  const [metrics, setMetrics] = useState(null);
  const [usersPage, setUsersPage] = useState({ items: [], total: 0 });
  const [projectsList, setProjectsList] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [disputesList, setDisputesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [features, setFeatures] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [contractStatusFilter, setContractStatusFilter] = useState('');
  const [auditPage, setAuditPage] = useState({ data: [], total: 0, page: 1, totalPages: 1 });

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [contractCancelTarget, setContractCancelTarget] = useState(null);
  const [contractCancelReason, setContractCancelReason] = useState('');

  // Filtering & Search (users are filtered on the server)
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

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
      const [dash, projs, pays, withs, disps, cats, setts, feats, skills] = await Promise.all([
        api.admin.dashboard(),
        api.admin.projects({ limit: 50 }),
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
      setPaymentRequests(pays.items);
      setWithdrawalRequests(withs.items);
      setDisputesList(disps.items);
      setCategoriesList(cats);
      setFeatures(feats);
      setSettingsForm({
        commissionPercent: setts.commission_percentage ?? 10,
        bankName: setts.payment_instructions?.bankName || '',
        accountName: setts.payment_instructions?.accountName || '',
        accountNumber: setts.payment_instructions?.accountNumber || '',
        phone: setts.payment_instructions?.phone || '',
        paymentNotes: setts.payment_instructions?.notes || '',
        withdrawalInstructions: setts.withdrawal_instructions || '',
      });
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useLoader(loadAllAdminData, []);

  // Users: server-side search, debounced while typing.
  const loadUsers = useCallback(async (search, role) => {
    try {
      setUsersPage(await api.admin.users({ search, role, limit: 100 }));
    } catch (err) {
      showError(err.message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(userSearch.trim(), userRoleFilter), 300);
    return () => clearTimeout(timer);
  }, [userSearch, userRoleFilter, loadUsers]);

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
    loadUsers(userSearch.trim(), userRoleFilter);
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

  // 3. Withdrawals: approve → record payout (with reference) | reject
  const handleApproveWithdrawal = (wReq) => {
    setConfirmModal({
      isOpen: true,
      title: 'اعتماد طلب السحب',
      message: `اعتماد سحب ${Number(wReq.amount || 0).toLocaleString()} ج.س لـ ${wReq.freelancerName}؟ ستسجّل التحويل الفعلي بعد تنفيذه.`,
      confirmText: 'اعتماد',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: () => {
        closeConfirm();
        runAction(() => api.admin.approveWithdrawal(wReq.id), 'تم اعتماد طلب السحب. سجّل التحويل بعد تنفيذه.');
      }
    });
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    if (!payoutTarget || payoutReference.trim().length < 3) return;
    setSubmittingWithdrawalAction(true);
    const ok = await runAction(
      () => api.admin.markWithdrawalPaid(payoutTarget.id, { transactionReference: payoutReference.trim(), note: payoutNote.trim() }),
      'تم تسجيل التحويل وإشعار المستقل برقم العملية.'
    );
    if (ok) {
      setPayoutTarget(null);
      setPayoutReference('');
      setPayoutNote('');
    }
    setSubmittingWithdrawalAction(false);
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

  // 6. Platform Settings Update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const ok = await runAction(
      () =>
        api.admin.saveSettings({
          commission_percentage: Number(settingsForm.commissionPercent),
          payment_instructions: {
            bankName: settingsForm.bankName.trim(),
            accountName: settingsForm.accountName.trim(),
            accountNumber: settingsForm.accountNumber.trim(),
            phone: settingsForm.phone.trim(),
            notes: settingsForm.paymentNotes.trim(),
          },
          withdrawal_instructions: settingsForm.withdrawalInstructions.trim(),
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

  // Metrics (from the server; a genuine zero is shown as zero)
  const pendingPaymentsCount = metrics?.payments.pending ?? 0;
  const pendingWithdrawalsCount = (metrics?.withdrawals.pending ?? 0) + (metrics?.withdrawals.approved ?? 0);
  const openDisputesCount = metrics?.reports.open ?? 0;
  const filteredUsers = usersPage.items;

  if (loading) {
    return (
      <div className="admin-dashboard-page" dir="rtl">
        <DashboardNavbar />
        <main className="admin-main">
          <div className="admin-container">
            <p>جارٍ تحميل بيانات لوحة الإدارة...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page" dir="rtl">
      <DashboardNavbar />

      <main className="admin-main">
        <div className="admin-container">

          {/* Breadcrumb Navigation */}
          <div className="admin-breadcrumb">
            <Link to="/admin" className="breadcrumb-link">الرئيسية</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">لوحة الإدارة والتحكيم</span>
          </div>

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

          {/* Admin Hero Header */}
          <div className="admin-hero-card">
            <div className="admin-hero-info">
              <div className="admin-badge">
                <FiShield />
                <span>إدارة المنصة المركزية والتحكيم</span>
              </div>
              <h1 className="admin-title">لوحة تحكم منصة سوداوورك (SudaWork Control)</h1>
              <p className="admin-subtitle">
                متابعة حركة المنصة الحية، تدقيق إيداعات بنكك، تفعيل العقود، حل النزاعات، وإدارة الحسابات.
              </p>
            </div>

            <div className="admin-user-tag">
              <div className="admin-avatar-box">
                <FiShield />
              </div>
              <div>
                <span className="admin-name">{user?.fullName}</span>
                <span className="admin-role">مدير النظام</span>
              </div>
            </div>
          </div>

          {/* Platform KPI Metrics Grid */}
          {metrics && (
            <div className="admin-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-wrap users">
                  <FiUsers />
                </div>
                <div className="metric-data">
                  <span className="metric-num">{metrics.users.total}</span>
                  <span className="metric-title">
                    إجمالي المستخدمين ({metrics.users.clients} عميل · {metrics.users.freelancers} مستقل)
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap projects">
                  <FiBriefcase />
                </div>
                <div className="metric-data">
                  <span className="metric-num">{metrics.projects.open}</span>
                  <span className="metric-title">مشاريع مفتوحة ({metrics.contracts.active} عقد نشط)</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap escrow">
                  <FiDollarSign />
                </div>
                <div className="metric-data">
                  <span className="metric-num">{metrics.contracts.escrowHeld.toLocaleString()} ج.س</span>
                  <span className="metric-title">أموال الضمان المحتجزة (عقود نشطة)</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap commission">
                  <FiTrendingUp />
                </div>
                <div className="metric-data">
                  <span className="metric-num">{metrics.revenue.platformFees.toLocaleString()} ج.س</span>
                  <span className="metric-title">عمولة المنصة المحققة (عقود مكتملة)</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap disputes">
                  <FiAlertTriangle />
                </div>
                <div className="metric-data">
                  <span className="metric-num">{openDisputesCount}</span>
                  <span className="metric-title">قضايا نزاع مفتوحة</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation Tabs */}
          <div className="admin-tabs-nav">
            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiActivity />
              <span>طابور العمليات والمهام</span>
              {(pendingPaymentsCount > 0 || pendingWithdrawalsCount > 0 || openDisputesCount > 0) && (
                <span className="tab-alert-dot" />
              )}
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers />
              <span>المستخدمون ({metrics?.users.total ?? usersPage.total})</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'escrow' ? 'active' : ''}`}
              onClick={() => setActiveTab('escrow')}
            >
              <FiDollarSign />
              <span>تدقيق المدفوعات ({paymentRequests.length})</span>
              {pendingPaymentsCount > 0 && (
                <span className="tab-pill-badge">{pendingPaymentsCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdrawals')}
            >
              <FiTrendingUp />
              <span>سحب الأرباح ({withdrawalRequests.length})</span>
              {pendingWithdrawalsCount > 0 && (
                <span className="tab-pill-badge">{pendingWithdrawalsCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'contracts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contracts')}
            >
              <FiFileText />
              <span>العقود</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'disputes' ? 'active' : ''}`}
              onClick={() => setActiveTab('disputes')}
            >
              <FiAlertTriangle />
              <span>التحكيم والنزاعات ({disputesList.length})</span>
              {openDisputesCount > 0 && (
                <span className="tab-pill-badge warning">{openDisputesCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <FiBriefcase />
              <span>المشاريع والتصنيفات</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <FiToggleRight />
              <span>إدارة الميزات</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <FiList />
              <span>سجل العمليات</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings />
              <span>إعدادات النظام</span>
            </button>
          </div>

          {activeTab === 'overview' && (
            <AdminOverviewTab
              pendingPaymentsCount={pendingPaymentsCount}
              pendingWithdrawalsCount={pendingWithdrawalsCount}
              openDisputesCount={openDisputesCount}
              onRefresh={refreshAll}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              filteredUsers={filteredUsers}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              onToggleUserStatus={handleToggleUserStatus}
              currentUserId={user?.id}
            />
          )}

          {activeTab === 'escrow' && (
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

          {activeTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              withdrawalRequests={withdrawalRequests}
              onApproveWithdrawal={handleApproveWithdrawal}
              onMarkPaid={(w) => {
                setPayoutReference('');
                setPayoutNote('');
                setPayoutTarget(w);
              }}
              onRejectWithdrawal={(w) => {
                setWithdrawalRejectReason('');
                setWithdrawalRejectTarget(w);
              }}
            />
          )}

          {activeTab === 'contracts' && (
            <AdminContractsTab
              contracts={contractsList}
              statusFilter={contractStatusFilter}
              setStatusFilter={setContractStatusFilter}
              onCancelContract={(c) => {
                setContractCancelReason('');
                setContractCancelTarget(c);
              }}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditTab
              logs={auditPage.data}
              total={auditPage.total}
              page={auditPage.page}
              totalPages={auditPage.totalPages}
              onPageChange={loadAudit}
            />
          )}

          {activeTab === 'disputes' && (
            <AdminDisputesTab
              disputesList={disputesList}
              onOpenResolveDispute={(disp) => {
                setSelectedDispute(disp);
                setDisputeNewStatus(disp.status === 'Open' ? 'In Review' : 'Resolved');
                setDisputeAction('none');
                setDisputeResolutionNotes(disp.resolutionNotes || '');
              }}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsTab
              categoriesList={categoriesList}
              projectsList={projectsList}
              onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
              onDeleteCategory={handleDeleteCategory}
              onModerateProject={handleModerateProject}
              skillsList={skillsList}
              onOpenSkillModal={() => setIsSkillModalOpen(true)}
              onToggleSkill={handleToggleSkill}
            />
          )}

          {activeTab === 'features' && (
            <AdminFeaturesTab features={features} onChange={handleFeatureChange} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              onSaveSettings={handleSaveSettings}
              saving={savingSettings}
            />
          )}

        </div>
      </main>

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
                      <option value="suspend_user">تعليق حساب الطرف المشكو في حقه</option>
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

      {/* Record Manual Payout Modal */}
      {payoutTarget && (
        <div className="admin-modal-backdrop" onClick={() => !submittingWithdrawalAction && setPayoutTarget(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>تسجيل تحويل أرباح {payoutTarget.freelancerName}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setPayoutTarget(null)} disabled={submittingWithdrawalAction}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleMarkPaid} className="modal-form">
              <div className="dispute-summary-preview">
                <p><strong>المبلغ:</strong> {Number(payoutTarget.amount).toLocaleString()} ج.س</p>
                <p><strong>الطريقة:</strong> {payoutTarget.method}</p>
                <p><strong>الحساب:</strong> {payoutTarget.accountNumber} — {payoutTarget.accountName}</p>
              </div>
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
                  placeholder="مثال: BNK-PAY-29384"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="payout-note">ملاحظة داخلية (اختياري)</label>
                <input
                  id="payout-note"
                  type="text"
                  className="modal-input"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-primary-btn" disabled={submittingWithdrawalAction || payoutReference.trim().length < 3}>
                  <FiCheck />
                  <span>{submittingWithdrawalAction ? 'جارٍ التسجيل...' : 'تأكيد تسجيل التحويل'}</span>
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

      <Footer />
    </div>
  );
};

export default AdminDashboard;
