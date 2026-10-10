import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ContractsList.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import defaultAvatar from '../../assets/default-avatar.svg';
import {
  FiFileText,
  FiArrowRight,
  FiBriefcase
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const ContractsList = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const loadData = async () => {
    try {
      setContracts(await api.contracts.list());
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadData, [user?.id], Boolean(user));

  // Tab Filtering
  const filteredContracts = contracts.filter((c) => {
    if (activeTab === 'awaiting') return c.status === 'Awaiting Payment';
    if (activeTab === 'active') return c.status === 'Active' || c.status === 'Revision Requested';
    if (activeTab === 'submitted') return c.status === 'Submitted';
    if (activeTab === 'completed') return c.status === 'Completed';
    return true;
  });

  const awaitingCount = contracts.filter((c) => c.status === 'Awaiting Payment').length;
  const activeCount = contracts.filter((c) => c.status === 'Active' || c.status === 'Revision Requested').length;
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
          ) : loadError ? (
            <ErrorState title="تعذر تحميل العقود" error={loadError} onRetry={() => { setLoading(true); loadData(); }} />
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
                const isClientView = user?.role === 'client';
                const counterparty = {
                  name: isClientView ? c.freelancerName : c.clientName,
                  photo: isClientView ? c.freelancerAvatar : c.clientAvatar,
                };
                const delivCount = c.deliverablesCount;

                return (
                  <div key={c.id} className={`contract-card status-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    
                    {/* Card Top */}
                    <div className="card-top-row">
                      <span className="contract-num">عقد #{c.id.slice(0, 8)}</span>
                      <span className={`contract-status-badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {c.status === 'Awaiting Payment' && 'بانتظار الضمان'}
                        {c.status === 'Active' && 'ساري - قيد العمل'}
                        {c.status === 'Submitted' && 'تم التسليم - قيد المراجعة'}
                        {c.status === 'Revision Requested' && 'مطلوب تعديلات'}
                        {c.status === 'Completed' && 'مكتمل بنجاح'}
                        {c.status === 'Cancelled' && 'ملغي'}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="card-project-title">
                      <Link to={`/contracts/${c.id}`}>{c.projectTitle}</Link>
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
                        <strong className="metric-val">{c.deliveryDate || `${c.deliveryDays} يوم`}</strong>
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
