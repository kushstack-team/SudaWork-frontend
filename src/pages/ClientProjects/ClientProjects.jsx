import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ClientProjects.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import { PROJECT_STATUS, CLIENT_MANAGEABLE_PROJECT_STATUSES } from '../../constants/projectStatuses';
import {
  FiPlus,
  FiFolder,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiTrash2,
  FiXCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const ClientProjects = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionNotice, setActionNotice] = useState(
    location.state?.projectSuccessMessage || ''
  );
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (location.state?.projectSuccessMessage) {
      const timer = setTimeout(() => setActionNotice(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.projectSuccessMessage]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning',
    onConfirm: null
  });

  const loadProjects = async () => {
    try {
      setProjects(await api.projects.mine());
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadProjects, [user?.id], Boolean(user));

  const runAction = async (fn, notice) => {
    setActionError('');
    try {
      await fn();
      setActionNotice(notice);
      setTimeout(() => setActionNotice(''), 3500);
      loadProjects();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف المشروع',
      message: 'هل أنت متأكد من رغبتك في حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'حذف المشروع',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        runAction(() => api.projects.remove(id), 'تم حذف المشروع بنجاح.');
      }
    });
  };

  const handleCloseProject = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'إغلاق المشروع',
      message: 'هل تريد إغلاق هذا المشروع وإيقاف استقبال العروض؟ سيتم إبلاغ المستقلين الذين قدموا عروضاً.',
      confirmText: 'إغلاق المشروع',
      cancelText: 'إلغاء',
      type: 'warning',
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        runAction(() => api.projects.close(id), 'تم إغلاق المشروع وإلغاء استقبال العروض.');
      }
    });
  };

  // "In progress" covers every hired stage (awaiting payment through delivery).
  const IN_PROGRESS = ['Awaiting Payment', 'In Progress', 'Submitted'];
  // "Under review" covers projects waiting for admin approval and those sent back for changes.
  const IN_REVIEW = [PROJECT_STATUS.PENDING_REVIEW, PROJECT_STATUS.REJECTED];
  const tabStatus = (p) => {
    if (IN_PROGRESS.includes(p.status)) return 'In Progress';
    if (IN_REVIEW.includes(p.status)) return 'In Review';
    return p.status;
  };
  const filteredProjects = projects.filter((p) => activeTab === 'All' || tabStatus(p) === activeTab);

  return (
    <div className="client-projects-page" dir="rtl">
      <DashboardNavbar />

      <main className="client-projects-main">
        <div className="client-projects-container">

          {/* Header Bar */}
          <div className="client-projects-header">
            <div>
              <h1 className="page-title">إدارة مشاريعي</h1>
              <p className="page-subtitle">
                تابع حالة مشاريعك المنشورة، راجع عروض المستقلين، وقم بإدارة العقود الجارية.
              </p>
            </div>

            <Link to="/post-project" className="new-project-cta-btn">
              <FiPlus />
              <span>نشر مشروع جديد</span>
            </Link>
          </div>

          {actionNotice && (
            <div className="action-notification-banner" role="alert">
              <FiCheckCircle className="banner-icon" />
              <span>{actionNotice}</span>
            </div>
          )}
          {actionError && (
            <div className="action-notification-banner error" role="alert">
              <FiXCircle className="banner-icon" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Status Tabs */}
          <div className="status-tabs-strip">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
              onClick={() => setActiveTab('All')}
            >
              الكل ({projects.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'In Review' ? 'active' : ''}`}
              onClick={() => setActiveTab('In Review')}
            >
              قيد المراجعة ({projects.filter((p) => tabStatus(p) === 'In Review').length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Open' ? 'active' : ''}`}
              onClick={() => setActiveTab('Open')}
            >
              مفتوح للتقديم ({projects.filter((p) => p.status === 'Open').length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'In Progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('In Progress')}
            >
              قيد التنفيذ ({projects.filter((p) => tabStatus(p) === 'In Progress').length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('Completed')}
            >
              مكتمل ({projects.filter((p) => p.status === 'Completed').length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('Cancelled')}
            >
              ملغي ({projects.filter((p) => p.status === 'Cancelled').length})
            </button>
          </div>

          {/* Projects List */}
          {loading ? (
            <div className="projects-loading-state">
              <div className="projects-spinner" />
              <p>جارٍ تحميل مشاريعك...</p>
            </div>
          ) : loadError ? (
            <ErrorState title="تعذر تحميل مشاريعك" error={loadError} onRetry={() => { setLoading(true); loadProjects(); }} />
          ) : filteredProjects.length === 0 ? (
            <div className="empty-projects-card">
              <FiFolder className="empty-folder-icon" />
              <h3>{projects.length === 0 ? 'لم تنشر أي مشاريع بعد' : 'لا توجد مشاريع في هذا القسم'}</h3>
              <p>
                {projects.length === 0
                  ? 'انشر مشروعك الأول لتبدأ في تلقي العروض من المستقلين.'
                  : 'جرّب تبويباً آخر لعرض بقية مشاريعك.'}
              </p>
              {projects.length === 0 && (
                <Link to="/post-project" className="empty-post-btn">
                  نشر مشروع
                </Link>
              )}
            </div>
          ) : (
            <div className="projects-management-stack">
              {filteredProjects.map((p) => {
                const count = p.proposalsCount;
                return (
                  <div key={p.id} className="project-manage-card">
                    
                    <div className="card-top-row">
                      <div>
                        <span className="project-cat-pill">{p.categoryName || 'عام'}</span>
                        <h2 className="project-manage-title">
                          <Link to={`/projects/${p.id}`} className="project-link">
                            {p.title}
                          </Link>
                        </h2>
                      </div>

                      <span className={`status-pill pill-${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {{
                          'Pending Review': 'بانتظار موافقة الإدارة',
                          Rejected: 'مرفوض - يحتاج تعديل',
                          Open: 'مفتوح للتقديم',
                          'Awaiting Payment': 'بانتظار الدفع',
                          'In Progress': 'قيد التنفيذ',
                          Submitted: 'تم التسليم',
                          Completed: 'مكتمل',
                          Cancelled: 'ملغي',
                        }[p.status] || p.status}
                      </span>
                    </div>

                    {p.status === PROJECT_STATUS.PENDING_REVIEW && (
                      <p className="review-note-banner">
                        مشروعك قيد المراجعة من الإدارة وسيظهر للمستقلين فور الموافقة عليه.
                      </p>
                    )}
                    {p.status === PROJECT_STATUS.REJECTED && (
                      <p className="review-note-banner rejected">
                        لم تتم الموافقة على نشر المشروع{p.reviewNote ? `: ${p.reviewNote}` : '.'} عدّل المشروع لإعادة إرساله للمراجعة.
                      </p>
                    )}

                    <p className="project-manage-desc">{p.description}</p>

                    <div className="card-info-strip">
                      <div className="info-badge">
                        <FiDollarSign className="info-icon" />
                        <span>الميزانية: <strong>{Number(p.budget).toLocaleString()} ج.س</strong></span>
                      </div>
                      <div className="info-badge">
                        <FiClock className="info-icon" />
                        <span>موعد التسليم: {p.deadline}</span>
                      </div>
                      <div className="info-badge proposals-badge">
                        <FiUsers className="info-icon" />
                        <span>{count} عروض مقدمة</span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="card-actions-row">
                      {p.contractId ? (
                        <Link to={`/contracts/${p.contractId}`} className="view-proposals-cta">
                          <span>إدارة العقد</span>
                          <FiArrowLeft />
                        </Link>
                      ) : (
                        <Link to={`/projects/${p.id}`} className="view-proposals-cta">
                          <span>مراجعة العروض المقدمة ({count})</span>
                          <FiArrowLeft />
                        </Link>
                      )}

                      {CLIENT_MANAGEABLE_PROJECT_STATUSES.includes(p.status) && (
                        <div className="open-actions-group">
                          <Link
                            to={`/projects/${p.id}/edit`}
                            className="action-icon-btn edit-btn"
                            title="تعديل المشروع"
                          >
                            <FiEdit2 />
                            <span>تعديل</span>
                          </Link>
                          <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            onClick={() => handleDelete(p.id)}
                            disabled={count > 0}
                            title={count > 0 ? 'لا يمكن حذف مشروع لديه عروض، يمكنك إغلاقه' : 'حذف المشروع'}
                          >
                            <FiTrash2 />
                            <span>حذف</span>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn close-btn"
                            onClick={() => handleCloseProject(p.id)}
                            title="إغلاق المشروع"
                          >
                            <FiXCircle />
                            <span>إغلاق</span>
                          </button>
                        </div>
                      )}
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

export default ClientProjects;
