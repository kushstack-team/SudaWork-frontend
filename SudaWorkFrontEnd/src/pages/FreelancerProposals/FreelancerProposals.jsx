import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FreelancerProposals.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { calculateFreelancerNet } from '../../utils/finance';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import { 
  FiFileText, 
  FiClock, 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiTrash2, 
  FiArrowRight, 
  FiExternalLink,
  FiBriefcase,
  FiTrendingUp
} from 'react-icons/fi';

const FreelancerProposals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [contractsMap, setContractsMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
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
    if (!user) return;
    setLoading(true);
    try {
      const [userProposals, allProjects, userContracts, allCategories] = await Promise.all([
        mockApi.proposals.getByFreelancer(user.id),
        mockApi.projects.getAll(),
        mockApi.contracts.getByUser(user.id),
        mockApi.categories.getAll(),
      ]);

      setProposals(userProposals);

      // Build maps
      const projMap = {};
      allProjects.forEach((p) => {
        projMap[p.id] = p;
      });
      setProjectsMap(projMap);

      const contMap = {};
      userContracts.forEach((c) => {
        contMap[c.projectId] = c;
      });
      setContractsMap(contMap);

      const catMap = {};
      allCategories.forEach((c) => {
        catMap[c.id] = c.name;
      });
      setCategoriesMap(catMap);
    } catch (err) {
      console.error('Failed to load freelancer proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Withdraw proposal
  const handleWithdraw = (proposalId) => {
    setConfirmModal({
      isOpen: true,
      title: 'سحب العرض',
      message: 'هل أنت متأكد من رغبتك في سحب هذا العرض؟ سيتم إزالته نهائياً.',
      confirmText: 'سحب العرض',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => performWithdraw(proposalId)
    });
  };

  const performWithdraw = async (proposalId) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setWithdrawingId(proposalId);
    try {
      await mockApi.proposals.delete(proposalId);
      setActionSuccess('تم سحب العرض بنجاح.');
      setTimeout(() => setActionSuccess(''), 3500);
      loadData();
    } catch (err) {
      console.error('Failed to withdraw proposal:', err);
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
          ) : filteredProposals.length === 0 ? (
            /* Empty State */
            <div className="proposals-empty-card">
              <FiFileText className="empty-icon" />
              <h3>لا توجد عروض في هذا القسم</h3>
              <p>
                {activeTab === 'all'
                  ? 'لم تقم بتقديم أي عروض على المشاريع حتى الآن. ابدأ بالاطلاع على الفرص والمشاريع المتاحة.'
                  : `لا توجد عروض بحالة "${activeTab === 'pending' ? 'قيد المراجعة' : activeTab === 'accepted' ? 'مقبولة' : 'مستبعدة'}" حالياً.`}
              </p>
              <Link to="/projects" className="empty-cta-btn">
                استكشف المشاريع المتاحة الآن
              </Link>
            </div>
          ) : (
            /* Proposals Grid / List */
            <div className="proposals-cards-container">
              {filteredProposals.map((prop) => {
                const project = projectsMap[prop.projectId] || {
                  title: 'مشروع في منصة سوداوورك',
                  budget: 0,
                  status: 'Open',
                  categoryId: '',
                };
                const categoryName = categoriesMap[project.categoryId] || 'عام';
                const contract = contractsMap[prop.projectId];

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
                        {project.title}
                      </Link>
                    </h3>

                    {/* Proposal Financial Terms */}
                    <div className="proposal-financial-grid">
                      <div className="financial-item">
                        <span className="item-label">قيمة عرضك</span>
                        <strong className="item-val price">{Number(prop.bidAmount).toLocaleString()} ج.س</strong>
                      </div>
                      <div className="financial-item">
                        <span className="item-label">صافي أرباحك (بعد العمولة 10%)</span>
                        <strong className="item-val net">{Number(calculateFreelancerNet(prop.bidAmount)).toLocaleString()} ج.س</strong>
                      </div>
                      <div className="financial-item">
                        <span className="item-label">مدة التنفيذ</span>
                        <strong className="item-val">{prop.deliveryTime} يوم</strong>
                      </div>
                      <div className="financial-item">
                        <span className="item-label">ميزانية المشروع</span>
                        <strong className="item-val budget">{Number(project.budget || 0).toLocaleString()} ج.س</strong>
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

                        {prop.status === 'Accepted' && contract && (
                          <Link to={`/contracts/${contract.id}`} className="view-contract-btn">
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
