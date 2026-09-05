import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { calculatePlatformFee } from '../../utils/finance';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
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
  FiPlus
} from 'react-icons/fi';

// Modular Tab Components
import AdminOverviewTab from './components/AdminOverviewTab';
import AdminUsersTab from './components/AdminUsersTab';
import AdminEscrowTab from './components/AdminEscrowTab';
import AdminWithdrawalsTab from './components/AdminWithdrawalsTab';
import AdminDisputesTab from './components/AdminDisputesTab';
import AdminProjectsTab from './components/AdminProjectsTab';
import AdminSettingsTab from './components/AdminSettingsTab';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview | users | escrow | withdrawals | disputes | projects | settings
  const [loading, setLoading] = useState(true);

  // Core entities state
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [disputesList, setDisputesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [settings, setSettings] = useState(null);

  // Filtering & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Modals & Action States
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputeResolutionNotes, setDisputeResolutionNotes] = useState('');
  const [disputeNewStatus, setDisputeNewStatus] = useState('Resolved');
  const [submittingDisputeResolution, setSubmittingDisputeResolution] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingPaymentAction, setSubmittingPaymentAction] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [settingsForm, setSettingsForm] = useState({
    commissionPercent: 10,
    paymentInstructions: '',
    withdrawalInstructions: '',
  });

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

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [u, p, c, pays, withs, disps, cats, setts] = await Promise.all([
        mockApi.users.getAll(),
        mockApi.projects.getAll(),
        mockApi.contracts.getAll(),
        mockApi.paymentRequests.getAll(),
        mockApi.withdrawalRequests.getAll(),
        mockApi.reports.getAll(),
        mockApi.categories.getAll(),
        mockApi.settings.get(),
      ]);

      setUsersList(u || []);
      setProjectsList(p || []);
      setContractsList(c || []);
      setPaymentRequests(pays || []);
      setWithdrawalRequests(withs || []);
      setDisputesList(disps || []);
      setCategoriesList(cats || []);
      setSettings(setts || {});

      if (setts) {
        setSettingsForm({
          commissionPercent: setts.commissionPercent ?? 10,
          paymentInstructions: setts.paymentInstructions ?? '',
          withdrawalInstructions: setts.withdrawalInstructions ?? '',
        });
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showSuccess = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(''), 5000);
  };

  const showError = (msg) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(''), 5000);
  };

  // 1. User Management Actions
  const handleToggleUserStatus = (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const actionText = nextStatus === 'suspended' ? 'تجميد حساب' : 'تفعيل حساب';

    setConfirmModal({
      isOpen: true,
      title: `${actionText}`,
      message: `هل أنت متأكد من ${actionText} ${targetUser.fullName}؟`,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
      type: nextStatus === 'suspended' ? 'danger' : 'success',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.users.updateStatus(targetUser.id, nextStatus);
          showSuccess(`تم ${nextStatus === 'suspended' ? 'تعليق' : 'تنشيط'} حساب ${targetUser.fullName} بنجاح.`);
          loadAllAdminData();
        } catch (err) {
          showError(err.message || 'فشل تعديل حالة المستخدم');
        }
      }
    });
  };

  // 2. Escrow Deposit Verification Actions
  const handleApprovePayment = (payReq) => {
    setConfirmModal({
      isOpen: true,
      title: 'اعتماد وتوثيق إيداع الضمان',
      message: `تأكيد استلام وتوثيق تحويل بنكك بمبلغ ${(payReq.amount || 0).toLocaleString()} ج.س وتفعيل العقد؟`,
      confirmText: 'اعتماد وتفعيل',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setSubmittingPaymentAction(true);
        try {
          await mockApi.paymentRequests.updateStatus(payReq.id, 'Approved');
          showSuccess(`تم اعتماد إيداع الضمان وتفعيل العقد المرتبط بنجاح!`);
          loadAllAdminData();
        } catch (err) {
          showError(err.message || 'فشل اعتماد الدفعة');
        } finally {
          setSubmittingPaymentAction(false);
        }
      }
    });
  };

  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setSubmittingPaymentAction(true);
    try {
      await mockApi.paymentRequests.updateStatus(selectedPayment.id, 'Rejected', rejectionReason.trim() || 'رقم المعاملة غير مطابق');
      showSuccess(`تم رفض طلب الإيداع وتنبيه العميل.`);
      setSelectedPayment(null);
      setRejectionReason('');
      loadAllAdminData();
    } catch (err) {
      showError(err.message || 'فشل رفض الدفعة');
    } finally {
      setSubmittingPaymentAction(false);
    }
  };

  // 3. Withdrawal Requests Approval Actions
  const handleApproveWithdrawal = (wReq) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد إرسال التحويل البنكي',
      message: `تأكيد إرسال التحويل البنكي بقيمة ${(wReq.amount || 0).toLocaleString()} ج.س لحساب المستقل؟`,
      confirmText: 'تأكيد التحويل',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.withdrawalRequests.updateStatus(wReq.id, 'Paid');
          showSuccess(`تم تأكيد إتمام عملية سحب الأرباح بنجاح.`);
          loadAllAdminData();
        } catch (err) {
          showError(err.message || 'فشل اعتماد طلب السحب');
        }
      }
    });
  };

  const handleRejectWithdrawal = (wReq) => {
    setConfirmModal({
      isOpen: true,
      title: 'رفض طلب السحب',
      message: 'هل أنت متأكد من رفض طلب السحب؟',
      confirmText: 'رفض الطلب',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.withdrawalRequests.updateStatus(wReq.id, 'Rejected');
          showSuccess(`تم رفض طلب السحب وإعادة الرصيد لمحفظة المستقل.`);
          loadAllAdminData();
        } catch (err) {
          showError(err.message || 'فشل رفض السحب');
        }
      }
    });
  };

  // 4. Dispute Resolution Handler
  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setSubmittingDisputeResolution(true);
    try {
      await mockApi.reports.updateStatus(
        selectedDispute.id,
        disputeNewStatus,
        disputeResolutionNotes.trim() || 'تم الفصل في النزاع بمعرفة إدارة المنصة.'
      );
      showSuccess(`تم تسجيل قرار التحكيم وتحديث حالة القضية.`);
      setSelectedDispute(null);
      setDisputeResolutionNotes('');
      loadAllAdminData();
    } catch (err) {
      showError(err.message || 'فشل تحديث قرار النزاع');
    } finally {
      setSubmittingDisputeResolution(false);
    }
  };

  // 5. Category Management Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await mockApi.categories.create({ name: newCategoryName.trim() });
      showSuccess('تمت إضافة التصنيف المهني بنجاح.');
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      showError(err.message || 'فشل إضافة التصنيف');
    }
  };

  const handleDeleteCategory = (catId) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف التصنيف',
      message: 'هل أنت متأكد من حذف هذا التصنيف؟',
      confirmText: 'حذف التصنيف',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.categories.delete(catId);
          showSuccess('تم حذف التصنيف بنجاح.');
          loadAllAdminData();
        } catch (err) {
          showError(err.message || 'فشل حذف التصنيف');
        }
      }
    });
  };

  // 6. Platform Settings Update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await mockApi.settings.update({
        commissionPercent: Number(settingsForm.commissionPercent) || 10,
        paymentInstructions: settingsForm.paymentInstructions,
        withdrawalInstructions: settingsForm.withdrawalInstructions,
      });
      showSuccess('تم حفظ إعدادات المنصة وتعليمات التحويل البنكي بنجاح.');
      loadAllAdminData();
    } catch (err) {
      showError(err.message || 'فشل حفظ الإعدادات');
    }
  };

  // Metrics Calculations
  const totalUsers = usersList.length;
  const activeProjectsCount = projectsList.filter((p) => p.status === 'Open' || p.status === 'In Progress').length;
  const pendingPaymentsCount = paymentRequests.filter((p) => p.status === 'Pending Verification').length;
  const pendingWithdrawalsCount = withdrawalRequests.filter((w) => w.status === 'Pending').length;
  const openDisputesCount = disputesList.filter((d) => d.status === 'Open' || d.status === 'In Review').length;

  const totalEscrowAmount = contractsList.reduce((sum, c) => {
    if (c.status === 'Active' || c.status === 'Submitted') {
      return sum + (c.agreedPrice || c.totalAmount || 0);
    }
    return sum;
  }, 0);

  const estimatedPlatformCommission = calculatePlatformFee(totalEscrowAmount);

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="admin-dashboard-page" dir="rtl">
      <DashboardNavbar />

      <main className="admin-main">
        <div className="admin-container">

          {/* Breadcrumb Navigation */}
          <div className="admin-breadcrumb">
            <Link to="/" className="breadcrumb-link">الرئيسية</Link>
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
                <span className="admin-name">{user?.fullName || 'مدير النظام'}</span>
                <span className="admin-role">صلاحيات المدير الكاملة (Super Admin)</span>
              </div>
            </div>
          </div>

          {/* Platform KPI Metrics Grid */}
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap users">
                <FiUsers />
              </div>
              <div className="metric-data">
                <span className="metric-num">{totalUsers}</span>
                <span className="metric-title">إجمالي المستخدمين</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap projects">
                <FiBriefcase />
              </div>
              <div className="metric-data">
                <span className="metric-num">{activeProjectsCount}</span>
                <span className="metric-title">مشاريع جارية ونشطة</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap escrow">
                <FiDollarSign />
              </div>
              <div className="metric-data">
                <span className="metric-num">{totalEscrowAmount.toLocaleString()} ج.س</span>
                <span className="metric-title">أموال الضمان المحتجزة (Escrow)</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap commission">
                <FiTrendingUp />
              </div>
              <div className="metric-data">
                <span className="metric-num">{estimatedPlatformCommission.toLocaleString()} ج.س</span>
                <span className="metric-title">أرباح عمولة المنصة التقديرية (10%)</span>
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
              <span>المستخدمون ({usersList.length})</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === 'escrow' ? 'active' : ''}`}
              onClick={() => setActiveTab('escrow')}
            >
              <FiDollarSign />
              <span>تدقيق إيداعات الضمان ({paymentRequests.length})</span>
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
              className={`admin-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings />
              <span>إعدادات النظام</span>
            </button>
          </div>

          {/* Tab 1: Overview & Urgent Action Queue */}
          {activeTab === 'overview' && (
            <AdminOverviewTab
              pendingPaymentsCount={pendingPaymentsCount}
              pendingWithdrawalsCount={pendingWithdrawalsCount}
              openDisputesCount={openDisputesCount}
              onRefresh={loadAllAdminData}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 2: Users Management */}
          {activeTab === 'users' && (
            <AdminUsersTab
              filteredUsers={filteredUsers}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {/* Tab 3: Escrow Deposits & Bankak Verification */}
          {activeTab === 'escrow' && (
            <AdminEscrowTab
              paymentRequests={paymentRequests}
              submittingPaymentAction={submittingPaymentAction}
              onApprovePayment={handleApprovePayment}
              onSelectRejectPayment={setSelectedPayment}
            />
          )}

          {/* Tab 4: Withdrawals Approval */}
          {activeTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              withdrawalRequests={withdrawalRequests}
              onApproveWithdrawal={handleApproveWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
            />
          )}

          {/* Tab 5: Disputes & Mediation */}
          {activeTab === 'disputes' && (
            <AdminDisputesTab
              disputesList={disputesList}
              onOpenResolveDispute={(disp) => {
                setSelectedDispute(disp);
                setDisputeNewStatus(disp.status === 'Resolved' ? 'Resolved' : 'In Review');
                setDisputeResolutionNotes(disp.resolutionNotes || '');
              }}
            />
          )}

          {/* Tab 6: Projects & Categories */}
          {activeTab === 'projects' && (
            <AdminProjectsTab
              categoriesList={categoriesList}
              projectsList={projectsList}
              onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* Tab 7: Platform Settings */}
          {activeTab === 'settings' && (
            <AdminSettingsTab
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              onSaveSettings={handleSaveSettings}
            />
          )}

        </div>
      </main>

      {/* Dispute Mediation Decision Modal */}
      {selectedDispute && (
        <div className="admin-modal-backdrop" onClick={() => !submittingDisputeResolution && setSelectedDispute(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>إصدار قرار تحكيم رسمي بخصوص النزاع #{selectedDispute.id}</h3>
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
                <p><strong>شكوى المدعي:</strong> {selectedDispute.description}</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dispute-status">تحديد الحالة الجديدة للقضية:</label>
                <select
                  id="dispute-status"
                  className="modal-select"
                  value={disputeNewStatus}
                  onChange={(e) => setDisputeNewStatus(e.target.value)}
                >
                  <option value="In Review">قيد المراجعة والتحكيم (In Review)</option>
                  <option value="Resolved">تم الحل والتسوية (Resolved)</option>
                  <option value="Dismissed">مرفوض أو ملغي (Dismissed)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dispute-notes">
                  توجيهات وقرار لجنة التحكيم الرسمية <span className="required">*</span>
                </label>
                <textarea
                  id="dispute-notes"
                  rows="4"
                  className="modal-textarea"
                  placeholder="اكتب التوجيه الملزم، مثل: تم الإفراج عن الدفعة بنسبة 70%، أو تم رد كامل الضمان للعميل لعدم الالتزام..."
                  value={disputeResolutionNotes}
                  onChange={(e) => setDisputeResolutionNotes(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingDisputeResolution || !disputeResolutionNotes.trim()}
                >
                  <FiCheck />
                  <span>{submittingDisputeResolution ? 'جارٍ تسجيل القرار...' : 'اعتماد قرار التحكيم'}</span>
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

      {/* Escrow Rejection Modal */}
      {selectedPayment && (
        <div className="admin-modal-backdrop" onClick={() => !submittingPaymentAction && setSelectedPayment(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>رفض إيداع الضمان #{selectedPayment.id}</h3>
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
                <label className="form-label" htmlFor="rejection-reason">سبب الرفض وتنبيه العميل:</label>
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
                  disabled={submittingPaymentAction || !rejectionReason.trim()}
                >
                  <FiX />
                  <span>{submittingPaymentAction ? 'جارٍ الرفض...' : 'تأكيد رفض الإيداع'}</span>
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

      {/* Accessible Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <Footer />
    </div>
  );
};

export default AdminDashboard;
