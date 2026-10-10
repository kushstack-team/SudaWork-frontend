import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FreelancerProposals.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { usePlatform } from '../../context/platform';
import { api } from '../../services/api';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { calculateFreelancerNet } from '../../utils/finance';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import {
  FiFileText,
  FiCheckCircle,
  FiTrash2,
  FiExternalLink,
  FiBriefcase
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const FreelancerProposals = () => {
  const { user } = useAuth();
  const { commissionPercent } = usePlatform();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [actionSuccess, setActionSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning',
    onConfirm: null
  });
  const [withdrawingId, setWithdrawingId] = useState(null);

  const loadData = async () => {
    try {
      setProposals(await api.proposals.mine());
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadData, [user?.id], Boolean(user));

  // Withdraw proposal
  const handleWithdraw = (proposalId) => {
    setConfirmModal({
      isOpen: true,
      title: 'سحب العرض',
      message: 'هل أنت متأكد من رغبتك في سحب هذا العرض؟ يمكنك تقديم عرض جديد لاحقاً ما دام المشروع مفتوحاً.',
      confirmText: 'سحب العرض',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => performWithdraw(proposalId)
    });
  };

  const performWithdraw = async (proposalId) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setWithdrawingId(proposalId);
    setActionError('');
    try {
      await api.proposals.withdraw(proposalId);
      setActionSuccess('تم سحب العرض بنجاح.');
      setTimeout(() => setActionSuccess(''), 3500);
      loadData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setWithdrawingId(null);
    }
  };

  // Filtered proposals
  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'pending') return p.status === 'Pending';
    if (activeTab === 'accepted') return p.status === 'Accepted';
    if (activeTab === 'rejected') return p.status === 'Rejected';
    return true;
  });

  const pendingCount = proposals.filter((p) => p.status === 'Pending').length;
  const acceptedCount = proposals.filter((p) => p.status === 'Accepted').length;
  const rejectedCount = proposals.filter((p) => p.status === 'Rejected').length;

  return (
    <div className="freelancer-proposals-page" dir="rtl">
      <DashboardNavbar />

      <main className="freelancer-proposals-main">
        <div className="proposals-page-container">

          {/* Page Header */}
          <div className="proposals-page-header">
            <div>
              <h1 className="page-heading">عروضي المقدمة</h1>
              <p className="page-subheading">
                تتبع حالة عروضك ومقترحاتك المالية والفنية على المشاريع التي تقدمت لها.
              </p>
            </div>
            <Link to="/projects" className="browse-projects-cta">
              <FiBriefcase className="btn-icon" />
              <span>تصفح المزيد من المشاريع</span>
            </Link>
          </div>

          {/* Success Banner */}
          {actionSuccess && (
            <div className="proposals-alert-banner" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="proposals-alert-banner error" role="alert">
              <span>{actionError}</span>
            </div>
          )}

          {/* Status Tabs */}
          <div className="proposals-tabs-strip">
            <button
              type="button"
              className={`status-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              الكل ({proposals.length})
            </button>
            <button
              type="button"
              className={`status-tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              قيد المراجعة ({pendingCount})
            </button>
            <button
              type="button"
              className={`status-tab ${activeTab === 'accepted' ? 'active' : ''}`}
              onClick={() => setActiveTab('accepted')}
            >
              المقبولة ({acceptedCount})
            </button>
            <button
              type="button"
              className={`status-tab ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              المستبعدة ({rejectedCount})
            </button>
          </div>

          {/* Content Loading */}
          {loading ? (
            <div className="proposals-loading-state">
              <div className="profile-spinner" />
              <p>جارٍ تحميل عروضك المقدمة...</p>
            </div>
          ) : loadError ? (
            <ErrorState title="تعذر تحميل عروضك" error={loadError} onRetry={() => { setLoading(true); loadData(); }} />
          ) : filteredProposals.length === 0 ? (
            /* Empty State */
            <div className="proposals-empty-card">
              <FiFileText className="empty-icon" />
              <h3>{proposals.length === 0 ? 'لا توجد عروض بعد' : 'لا توجد عروض في هذا القسم'}</h3>
              <p>
                {activeTab === 'all'
                  ? 'ستظهر عروضك المقدمة هنا. تصفح المشاريع المتاحة لتجد عملاً يناسب مهاراتك.'
                  : `لا توجد عروض بحالة "${activeTab === 'pending' ? 'قيد المراجعة' : activeTab === 'accepted' ? 'مقبولة' : 'مستبعدة'}" حالياً.`}
              </p>
              <Link to="/projects" className="empty-cta-btn">
                تصفح المشاريع
              </Link>
            </div>
          ) : (
            /* Proposals Grid / List */
            <div className="proposals-cards-container">
              {filteredProposals.map((prop) => {
                const categoryName = prop.categoryName || 'عام';

                return (
                  <div key={prop.id} className={`fl-proposal-card status-${prop.status.toLowerCase()}`}>
                    
                    {/* Card Top */}
                    <div className="proposal-card-top">
                      <div className="top-meta">
                        <span className="cat-badge">{categoryName}</span>
                        <span className="date-stamp">
                          {new Date(prop.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      <div className="status-badges-group">
                        <span className={`status-pill pill-${prop.status.toLowerCase()}`}>
                          {prop.status === 'Pending' && 'قيد المراجعة'}
                          {prop.status === 'Accepted' && 'تم قبول العرض!'}
                          {prop.status === 'Rejected' && 'مستبعد'}
                        </span>
                      </div>
                    </div>

                    {/* Project Title */}
                    <h3 className="proposal-project-title">
                      <Link to={`/projects/${prop.projectId}`} className="title-link">
                        {prop.projectTitle}
                      </Link>
                    </h3>

                    {/* Proposal Financial Terms */}
                    <div className="proposal-financial-grid">
                      <div className="financial-item">
                        <span className="item-label">قيمة عرضك</span>
                        <strong className="item-val price">{Number(prop.bidAmount).toLocaleString()} ج.س</strong>
                      </div>
                      <div className="financial-item">
                        <span className="item-label">صافي أرباحك (بعد عمولة {commissionPercent}%)</span>
                        <strong className="item-val net">{Number(calculateFreelancerNet(prop.bidAmount, commissionPercent)).toLocaleString()} ج.س</strong>
                      </div>
                      <div className="financial-item">
                        <span className="item-label">مدة التنفيذ</span>
                        <strong className="item-val">{prop.deliveryTime} يوم</strong>
                      </div>
                      <div className="financial-item">
                        <span className="item-label">ميزانية المشروع</span>
                        <strong className="item-val budget">{Number(prop.projectBudget || 0).toLocaleString()} ج.س</strong>
                      </div>
                    </div>

                    {/* Cover Letter Box */}
                    <div className="proposal-cover-box">
                      <h4 className="cover-title">رسالتك لصاحب المشروع:</h4>
                      <p className="cover-text">{prop.coverLetter}</p>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="proposal-card-actions">
                      <Link to={`/projects/${prop.projectId}`} className="view-project-link">
                        <span>عرض تفاصيل المشروع</span>
                        <FiExternalLink />
                      </Link>

                      <div className="right-action-buttons">
                        {prop.status === 'Pending' && (
                          <button
                            type="button"
                            className="withdraw-action-btn"
                            disabled={withdrawingId === prop.id}
                            onClick={() => handleWithdraw(prop.id)}
                          >
                            <FiTrash2 />
                            <span>{withdrawingId === prop.id ? 'جارٍ السحب...' : 'سحب العرض'}</span>
                          </button>
                        )}

                        {prop.status === 'Accepted' && prop.contractId && (
                          <Link to={`/contracts/${prop.contractId}`} className="view-contract-btn">
                            <FiCheckCircle />
                            <span>الانتقال إلى عقد العمل</span>
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

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

export default FreelancerProposals;
