import { Link } from 'react-router-dom';
import {
  FiFolder,
  FiPlus,
  FiClock,
  FiUsers,
  FiArrowLeft,
  FiTag
} from 'react-icons/fi';
import './ClientProjectsFeed.css';

const ClientProjectsFeed = ({ projects = [], proposalsMap = {}, loading = false }) => {
  return (
    <section className="client-projects-feed-section" dir="rtl">
      <div className="section-top-bar">
        <div>
          <h2 className="section-main-title">مشاريعك الحالية والعروض الواردة</h2>
          <p className="section-sub-title">
            تابع مستجدات المشاريع التي قمت بنشرها وتعرف على عروض المستقلين المتقدمين للعمل معك.
          </p>
        </div>

        <div className="section-top-actions">
          <Link to="/post-project" className="btn-post-new-project">
            <FiPlus />
            <span>نشر مشروع جديد</span>
          </Link>
          <Link to="/client/projects" className="btn-view-all-my-projects">
            <span>كافة مشاريعي ({projects.length})</span>
            <FiArrowLeft />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="feed-loading-box">
          <div className="feed-spinner" />
          <p>جارٍ تحميل بيانات مشاريعك...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="feed-empty-box">
          <div className="empty-icon-circle">
            <FiFolder className="empty-folder-icon" />
          </div>
          <h3>لم تنشر أي مشاريع بعد</h3>
          <p>
            انشر مشروعك الأول لتبدأ في تلقي العروض من المستقلين.
          </p>
          <Link to="/post-project" className="btn-create-first-project">
            <FiPlus />
            <span>نشر مشروع</span>
          </Link>
        </div>
      ) : (
        <div className="client-projects-grid">
          {projects.slice(0, 4).map((project) => {
            const proposalCount = proposalsMap[project.id] || 0;
            const isOpen = project.status === 'Open';
            const budgetFormatted = `${Number(project.budget || 0).toLocaleString()} ج.س`;
            const statusText = {
              'Awaiting Payment': 'بانتظار الدفع',
              'In Progress': 'قيد التنفيذ',
              Submitted: 'تم التسليم',
              Completed: 'مكتمل',
              Cancelled: 'مغلق',
            }[project.status] || project.status;

            return (
              <div key={project.id} className="client-project-card">
                <div className="card-top-row">
                  <div className="project-category-pill">
                    <FiTag className="pill-icon" />
                    <span>{project.categoryName || 'عام'}</span>
                  </div>

                  <span className={`project-status-badge ${isOpen ? 'status-open' : 'status-progress'}`}>
                    {isOpen ? (
                      <>
                        <span className="pulsing-dot" />
                        مفتوح للعروض
                      </>
                    ) : (
                      statusText
                    )}
                  </span>
                </div>

                <h3 className="project-card-title">
                  <Link to={`/projects/${project.id}`}>{project.title}</Link>
                </h3>

                <p className="project-card-desc">
                  {project.description?.length > 120
                    ? project.description.substring(0, 120) + '...'
                    : project.description}
                </p>

                <div className="project-card-meta-row">
                  <div className="meta-block budget">
                    <span className="meta-label">الميزانية:</span>
                    <strong className="meta-value">{budgetFormatted}</strong>
                  </div>

                  <div className="meta-block date">
                    <FiClock className="meta-icon" />
                    <span>
                      {new Date(project.createdAt).toLocaleDateString('ar-SD')}
                    </span>
                  </div>
                </div>

                <div className="card-bottom-actions">
                  <div className={`proposals-count-tag ${proposalCount > 0 ? 'has-proposals' : ''}`}>
                    <FiUsers className="prop-icon" />
                    <span>
                      <strong>{proposalCount}</strong> {proposalCount === 1 ? 'عرض مقدم' : 'عروض مقدمة'}
                    </span>
                  </div>

                  <Link to={project.contractId ? `/contracts/${project.contractId}` : `/projects/${project.id}`} className="btn-review-proposals">
                    <span>{project.contractId ? 'إدارة العقد' : 'مراجعة العروض'}</span>
                    <FiArrowLeft />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ClientProjectsFeed;
