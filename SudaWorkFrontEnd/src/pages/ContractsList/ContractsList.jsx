import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ContractsList.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
import { 
  FiFileText, 
  FiClock, 
  FiDollarSign, 
  FiCheckCircle, 
  FiShield, 
  FiArrowRight,
  FiExternalLink,
  FiBriefcase,
  FiAlertCircle
} from 'react-icons/fi';

const ContractsList = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [counterpartyMap, setCounterpartyMap] = useState({});
  const [deliverablesCountMap, setDeliverablesCountMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userContracts = await mockApi.contracts.getByUser(user.id);
      setContracts(userContracts);

      const allProjects = await mockApi.projects.getAll();
      const pMap = {};
      allProjects.forEach((p) => {
        pMap[p.id] = p;
      });
      setProjectsMap(pMap);

      // Load counterparty profiles and deliverables counts
      const cpMap = {};
      const delivMap = {};

      for (const c of userContracts) {
        const otherPartyId = user.role === 'client' ? c.freelancerId : c.clientId;
        const [otherUser, otherProf, delivs] = await Promise.all([
          mockApi.users.getById(otherPartyId),
          user.role === 'client' 
            ? mockApi.profiles.getFreelancerProfile(otherPartyId)
            : mockApi.profiles.getClientProfile(otherPartyId),
          mockApi.deliverables.getByContract(c.id),
        ]);

        cpMap[c.id] = {
          name: otherUser?.fullName || 'مستخدم سوداوورك',
          photo: user.role === 'client' ? otherProf?.photo : otherProf?.companyLogo || defaultAvatar,
          subtitle: user.role === 'client' ? otherProf?.title : otherProf?.companyName || 'حساب موثق',
        };

        delivMap[c.id] = delivs.length;
      }

      setCounterpartyMap(cpMap);
      setDeliverablesCountMap(delivMap);
    } catch (err) {
      console.error('Failed to load user contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Tab Filtering
  const filteredContracts = contracts.filter((c) => {
    if (activeTab === 'awaiting') return c.status === 'Awaiting Payment';
    if (activeTab === 'active') return c.status === 'Active';
    if (activeTab === 'submitted') return c.status === 'Submitted';
    if (activeTab === 'completed') return c.status === 'Completed';
    return true;
  });

  const awaitingCount = contracts.filter((c) => c.status === 'Awaiting Payment').length;
  const activeCount = contracts.filter((c) => c.status === 'Active').length;
  const submittedCount = contracts.filter((c) => c.status === 'Submitted').length;
  const completedCount = contracts.filter((c) => c.status === 'Completed').length;

  return (
    <div className="contracts-list-page" dir="rtl">
      <DashboardNavbar />

      <main className="contracts-list-main">
        <div className="contracts-list-container">

          {/* Page Header */}
          <div className="contracts-page-header">
            <div>
              <h1 className="page-title">عقود العمل والتسليمات</h1>
              <p className="page-desc">
                إدارة كافة عقودك السارية والمكتملة، ومتابعة تسليم مخرجات المشاريع والضمان المالي.
              </p>
            </div>

            {user?.role === 'client' ? (
              <Link to="/post-project" className="header-action-btn">
                <FiBriefcase />
                <span>نشر مشروع جديد</span>
              </Link>
            ) : (
              <Link to="/projects" className="header-action-btn">
                <FiBriefcase />
                <span>تصفح المشاريع</span>
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="contracts-tabs-strip">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              الكل ({contracts.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              سارية قيد التنفيذ ({activeCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
              onClick={() => setActiveTab('submitted')}
            >
              تم التسليم ({submittedCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'awaiting' ? 'active' : ''}`}
              onClick={() => setActiveTab('awaiting')}
            >
              بانتظار الضمان ({awaitingCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              مكتملة ({completedCount})
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="contracts-loading">
              <div className="profile-spinner" />
              <p>جارٍ تحميل عقود العمل...</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            /* Empty State */
            <div className="contracts-empty-card">
              <FiFileText className="empty-icon" />
              <h3>لا توجد عقود عمل في هذا القسم</h3>
              <p>
                {contracts.length === 0
                  ? 'لم تقم ببدء أي عقود عمل بعد. بعد قبول العروض يتم إنشاء عقود رسمية موثقة هنا.'
                  : 'لا توجد عقود مطابقة للتصنيف المحدد.'}
              </p>
              {user?.role === 'client' ? (
                <Link to="/client/projects" className="empty-cta">
                  استعرض مشاريعك وعروض المستقلين
                </Link>
              ) : (
                <Link to="/freelancer/proposals" className="empty-cta">
                  استعرض عروضك المقدمة
                </Link>
              )}
            </div>
          ) : (
            /* Contracts Grid */
            <div className="contracts-grid">
              {filteredContracts.map((c) => {
                const proj = projectsMap[c.projectId] || { title: 'مشروع في سوداوورك' };
                const counterparty = counterpartyMap[c.id] || {
                  name: 'مستخدم سوداوورك',
                  photo: defaultAvatar,
                  subtitle: '',
                };
                const delivCount = deliverablesCountMap[c.id] || 0;

                return (
                  <div key={c.id} className={`contract-card status-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    
                    {/* Card Top */}
                    <div className="card-top-row">
                      <span className="contract-num">عقد #{c.id}</span>
                      <span className={`contract-status-badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {c.status === 'Awaiting Payment' && 'بانتظار الضمان'}
                        {c.status === 'Active' && 'ساري - قيد العمل'}
                        {c.status === 'Submitted' && 'تم التسليم - قيد المراجعة'}
                        {c.status === 'Completed' && 'مكتمل بنجاح'}
                        {c.status === 'Cancelled' && 'ملغي'}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="card-project-title">
                      <Link to={`/contracts/${c.id}`}>{proj.title}</Link>
                    </h3>

                    {/* Counterparty Profile Strip */}
                    <div className="card-counterparty-strip">
                      <img src={counterparty.photo || defaultAvatar} alt={counterparty.name} className="cp-avatar" />
                      <div>
                        <span className="cp-role-label">
                          {user?.role === 'client' ? 'المستقل المنفذ:' : 'صاحب العمل:'}
                        </span>
                        <h4 className="cp-name">{counterparty.name}</h4>
                      </div>
                    </div>

                    {/* Financial Terms & Dates */}
                    <div className="card-metrics-grid">
                      <div className="metric-item">
                        <span className="metric-label">قيمة العقد</span>
                        <strong className="metric-val price">{Number(c.agreedPrice).toLocaleString()} ج.س</strong>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">موعد التسليم</span>
                        <strong className="metric-val">{c.deliveryDate}</strong>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">التسليمات</span>
                        <strong className="metric-val">{delivCount} مخرجات</strong>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="card-action-footer">
                      <Link to={`/contracts/${c.id}`} className="view-contract-link">
                        <span>عرض العقد وإدارة التسليم</span>
                        <FiArrowRight />
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContractsList;
