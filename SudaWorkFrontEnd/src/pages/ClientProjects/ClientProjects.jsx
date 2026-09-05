import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ClientProjects.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import { 
  FiPlus, 
  FiFolder, 
  FiClock, 
  FiDollarSign, 
  FiUsers, 
  FiEdit, 
  FiTrash2, 
  FiXCircle, 
  FiArrowLeft,
  FiCheckCircle
} from 'react-icons/fi';

const ClientProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [proposalsCounts, setProposalsCounts] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
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
    if (!user?.id) return;
    setLoading(true);
    try {
      const [cats, projs] = await Promise.all([
        mockApi.categories.getAll(),
        mockApi.projects.getAll({ clientId: user.id }),
      ]);

      setCategories(cats);
      setProjects(projs);

      const counts = {};
      for (const p of projs) {
        const pList = await mockApi.proposals.getByProject(p.id);
        counts[p.id] = pList.length;
      }
      setProposalsCounts(counts);
    } catch (err) {
      console.error('Failed to load client projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف المشروع',
      message: 'هل أنت متأكد من رغبتك في حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'حذف المشروع',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.projects.delete(id);
          setActionNotice('تم حذف المشروع بنجاح.');
          setTimeout(() => setActionNotice(''), 3500);
          loadProjects();
        } catch (err) {
          console.error('Failed to delete project:', err);
        }
      }
    });
  };

  const handleCloseProject = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'إغلاق المشروع',
      message: 'هل تريد إغلاق هذا المشروع وإيقاف استقبال العروض؟',
      confirmText: 'إغلاق المشروع',
      cancelText: 'إلغاء',
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.projects.update(id, { status: 'Cancelled' });
          setActionNotice('تم إغلاق المشروع وإلغاء استقبال العروض.');
          setTimeout(() => setActionNotice(''), 3500);
          loadProjects();
        } catch (err) {
          console.error('Failed to close project:', err);
        }
      }
    });
  };

  const getCategoryName = (catId) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.name : 'خدمات عامة';
  };

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'All') return true;
    return p.status === activeTab;
  });

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
              قيد التنفيذ ({projects.filter((p) => p.status === 'In Progress').length})
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
          ) : filteredProjects.length === 0 ? (
            <div className="empty-projects-card">
              <FiFolder className="empty-folder-icon" />
              <h3>لا توجد مشاريع في هذا القسم</h3>
              <p>يمكنك نشر مشروع جديد للبدء في استلام عروض الأسعار من أفضل المستقلين.</p>
              <Link to="/post-project" className="empty-post-btn">
                نشر مشروع جديد الآن
              </Link>
            </div>
          ) : (
            <div className="projects-management-stack">
              {filteredProjects.map((p) => {
                const count = proposalsCounts[p.id] || 0;
                return (
                  <div key={p.id} className="project-manage-card">
                    
                    <div className="card-top-row">
                      <div>
                        <span className="project-cat-pill">{getCategoryName(p.categoryId)}</span>
                        <h2 className="project-manage-title">
                          <Link to={`/projects/${p.id}`} className="project-link">
                            {p.title}
                          </Link>
                        </h2>
                      </div>

                      <span className={`status-pill pill-${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {p.status === 'Open' ? 'مفتوح للتقديم' : p.status === 'In Progress' ? 'قيد التنفيذ' : p.status === 'Completed' ? 'مكتمل' : 'ملغي'}
                      </span>
                    </div>

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
                      <Link to={`/projects/${p.id}`} className="view-proposals-cta">
                        <span>مراجعة العروض المقدمة ({count})</span>
                        <FiArrowLeft />
                      </Link>

                      {p.status === 'Open' && (
                        <div className="open-actions-group">
                          <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            onClick={() => handleDelete(p.id)}
                            title="حذف المشروع"
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
