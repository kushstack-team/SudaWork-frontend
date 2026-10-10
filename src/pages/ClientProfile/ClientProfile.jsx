import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ClientProfile.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import ReportModal from '../../components/ReportModal/ReportModal';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import { FiFlag } from 'react-icons/fi';
import defaultLogo from '../../assets/default-avatar.svg';
import { 
  FiBriefcase, 
  FiMapPin, 
  FiPhone, 
  FiStar, 
  FiCalendar, 
  FiEdit,
  FiAlertTriangle,
  FiArrowLeft
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const ClientProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [clientUser, setClientUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const isOwner = user?.id === id;
  const { isFeatureAvailable } = usePlatform();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const canReport = isAuthenticated && !isOwner && user?.role !== 'admin' && isFeatureAvailable(FEATURES.DISPUTES);

  const fetchData = async () => {
    try {
      const [{ user: u, profile: p }, r] = await Promise.all([api.profiles.getClient(id), api.reviews.forUser(id)]);
      setClientUser(u);
      setProfile(p);
      setReviews(r.items);
      // Owners see all their projects; visitors see the client's open projects.
      try {
        setProjects(isOwner ? await api.projects.mine() : (await api.projects.browse({ client: id, limit: 20 })).items);
      } catch {
        setProjects([]);
      }
      setLoadError(null);
    } catch (err) {
      if (err.isNotFound) {
        setClientUser(null);
        setProfile(null);
      } else {
        setLoadError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useLoader(fetchData, [id, isOwner], Boolean(id));

  if (loading) {
    return (
      <div className="client-view-loading" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل ملف صاحب العمل...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="client-not-found" dir="rtl">
        {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
        <main className="not-found-content">
          <ErrorState title="تعذر تحميل ملف صاحب العمل" error={loadError} onRetry={() => { setLoading(true); fetchData(); }} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!clientUser && !profile) {
    return (
      <div className="client-not-found" dir="rtl">
        {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
        <main className="not-found-content">
          <FiAlertTriangle className="warning-icon" />
          <h2>حساب العميل غير موجود</h2>
          <p>لم يتم العثور على صاحب العمل المطلوب أو تم إلغاء الحساب.</p>
          <Link to="/" className="back-home-btn">العودة للرئيسية</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const companyName = profile?.companyName || clientUser?.fullName || '';
  const description = profile?.description || 'لم تتم إضافة نبذة عن الشركة حتى الآن.';
  const location = profile?.location || 'غير محدد';
  const logo = profile?.logo || defaultLogo;
  const postedProjectsCount = profile?.postedProjectsCount || 0;

  return (
    <div className="client-profile-page" dir="rtl">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}

      <main className="client-profile-main">
        <div className="client-profile-container">

          {/* Hero Banner */}
          <div className="client-hero-card">
            <div className="client-hero-body">
              <div className="client-logo-wrapper">
                <img src={logo} alt={companyName} className="client-large-logo" />
              </div>

              <div className="client-identity">
                <h1 className="client-company-name">{companyName}</h1>
                <p className="client-manager-name">مسؤول الحساب: {clientUser?.fullName}</p>
                
                <div className="client-meta-strip">
                  <span className="client-meta-item">
                    <FiMapPin className="meta-icon" />
                    <span>{location}</span>
                  </span>
                  {profile?.contactInfo?.phone && (
                    <span className="client-meta-item">
                      <FiPhone className="meta-icon" />
                      <span>{profile.contactInfo.phone}</span>
                    </span>
                  )}
                  <span className="client-meta-item">
                    <FiCalendar className="meta-icon" />
                    <span>انضم في {clientUser?.createdAt ? new Date(clientUser.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) : '—'}</span>
                  </span>
                </div>
              </div>

              {isOwner && (
                <div className="client-actions-wrapper">
                  <button
                    type="button"
                    className="client-edit-btn"
                    onClick={() => navigate('/client/profile/edit')}
                  >
                    <FiEdit />
                    <span>تعديل الملف</span>
                  </button>
                </div>
              )}
              {canReport && (
                <div className="client-actions-wrapper">
                  <button type="button" className="report-link-btn" onClick={() => setReportOpen(true)} disabled={reportSent}>
                    <FiFlag />
                    <span>{reportSent ? 'تم إرسال البلاغ' : 'إبلاغ'}</span>
                  </button>
                </div>
              )}
              <ReportModal
                isOpen={reportOpen}
                targetType="user"
                targetId={id}
                targetLabel={clientUser?.fullName}
                onClose={() => setReportOpen(false)}
                onReported={() => setReportSent(true)}
              />
            </div>

            {/* Stats Row */}
            <div className="client-stats-strip">
              <div className="client-stat-item">
                <span className="stat-val">{postedProjectsCount}</span>
                <span className="stat-lbl">مشاريع تم نشرها</span>
              </div>
              <div className="client-stat-item">
                <span className="stat-val">{projects.filter((p) => p.status === 'Open').length}</span>
                <span className="stat-lbl">مشاريع متاحة للتقديم الآن</span>
              </div>
              <div className="client-stat-item">
                <span className="stat-val">{reviews.length}</span>
                <span className="stat-lbl">تقييمات من المستقلين</span>
              </div>
            </div>
          </div>

          {/* Two Columns Content */}
          <div className="client-content-layout">
            
            {/* Main Area: Description & Projects */}
            <div className="client-main-col">
              
              {/* About Box */}
              <section className="client-section-box">
                <h3 className="section-box-heading">نبذة عن صاحب العمل / المؤسسة</h3>
                <p className="client-desc-text">{description}</p>
              </section>

              {/* Projects posted */}
              <section className="client-section-box">
                <h3 className="section-box-heading">
                  المشاريع المنشورة ({projects.length})
                </h3>

                {projects.length === 0 ? (
                  <p className="empty-client-text">لا توجد مشاريع منشورة حالياً لهذا العميل.</p>
                ) : (
                  <div className="client-projects-list">
                    {projects.map((proj) => (
                      <div key={proj.id} className="client-project-item">
                        <div className="project-item-header">
                          <h4 className="project-item-title">{proj.title}</h4>
                          <span className={`project-status-tag status-${proj.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {{
                              Open: 'مفتوح للتقديم',
                              'Awaiting Payment': 'بانتظار الدفع',
                              'In Progress': 'قيد التنفيذ',
                              Submitted: 'تم التسليم',
                              Completed: 'مكتمل',
                              Cancelled: 'مغلق',
                            }[proj.status] || proj.status}
                          </span>
                        </div>
                        <p className="project-item-desc">{proj.description}</p>
                        <div className="project-item-footer">
                          <div className="project-item-budget">
                            <span>الميزانية المقدرة:</span>
                            <strong>{Number(proj.budget).toLocaleString()} ج.س</strong>
                          </div>
                          <Link to={`/projects/${proj.id}`} className="view-project-link">
                            <span>تفاصيل المشروع والتقديم</span>
                            <FiArrowLeft />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section className="client-section-box">
                <h3 className="section-box-heading">
                  تقييمات المستقلين ({reviews.length})
                </h3>
                {reviews.length === 0 ? (
                  <p className="empty-client-text">لا توجد تقييمات مسجلة بعد لهذا العميل.</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="review-item-card">
                        <div className="review-header">
                          <div className="review-stars">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={i < rev.rating ? 'star-filled' : 'star-empty'}
                              />
                            ))}
                          </div>
                          <span className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        {rev.reviewerName && <strong className="review-comment">{rev.reviewerName}</strong>}
                        {rev.comment && <p className="review-comment">{rev.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* Sidebar */}
            <aside className="client-side-col">
              <div className="client-section-box verified-client-card">
                <div className="verified-icon-title">
                  <FiBriefcase className="card-top-icon" />
                  <h4>صاحب عمل معتمد في سوداوورك</h4>
                </div>
                <p className="verified-card-text">
                  تتم حماية حقوق المستقلين عبر إيداع قيمة المشروع في خدمة الضمان (Escrow) قبل بدء العمل.
                </p>
              </div>
            </aside>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientProfile;
