import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './FreelancerProfile.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import ReportModal from '../../components/ReportModal/ReportModal';
import { FiFlag } from 'react-icons/fi';
import defaultAvatar from '../../assets/default-avatar.svg';
import { 
  FiStar, 
  FiMapPin, 
  FiCheckCircle, 
  FiBriefcase, 
  FiMessageSquare, 
  FiEdit,
  FiExternalLink,
  FiAlertTriangle
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const FreelancerProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { isFeatureAvailable } = usePlatform();
  const [freelancerUser, setFreelancerUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const isOwner = user?.id === id;
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const canReport = isAuthenticated && !isOwner && user?.role !== 'admin' && isFeatureAvailable(FEATURES.DISPUTES);
  const canContact = !isAuthenticated || (user?.role === 'client' && isFeatureAvailable(FEATURES.MESSAGING));
  const canHire = !isAuthenticated || (user?.role === 'client' && isFeatureAvailable(FEATURES.PROJECT_POSTING));

  const fetchData = async () => {
    try {
      const [{ user: u, profile: p }, r] = await Promise.all([
        api.profiles.getFreelancer(id),
        api.reviews.forUser(id),
      ]);
      setFreelancerUser(u);
      setProfile(p);
      setReviews(r.items);
      setLoadError(null);
    } catch (err) {
      if (err.isNotFound) {
        setFreelancerUser(null);
        setProfile(null);
      } else {
        setLoadError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useLoader(fetchData, [id], Boolean(id));

  if (loading) {
    return (
      <div className="freelancer-view-loading" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل ملف المستقل...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="freelancer-not-found" dir="rtl">
        {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
        <main className="not-found-content">
          <ErrorState title="تعذر تحميل ملف المستقل" error={loadError} onRetry={() => { setLoading(true); fetchData(); }} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!freelancerUser && !profile) {
    return (
      <div className="freelancer-not-found" dir="rtl">
        {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
        <main className="not-found-content">
          <FiAlertTriangle className="warning-icon" />
          <h2>المستقل غير موجود</h2>
          <p>لم يتم العثور على حساب المستقل المطلوب أو قد تم تعطيله.</p>
          <Link to="/" className="back-home-btn">العودة للرئيسية</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = freelancerUser?.fullName || '';
  const displayTitle = profile?.title || 'مستقل';
  const displayLocation = profile?.location || 'غير محدد';
  const displayBio = profile?.bio || 'لم تتم إضافة نبذة شخصية بعد.';
  const displayRating = profile?.avgRating || 0;
  const completedProjects = profile?.completedProjects || 0;
  const photo = profile?.photo || defaultAvatar;

  return (
    <div className="freelancer-profile-page" dir="rtl">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}

      <main className="freelancer-profile-main">
        <div className="freelancer-profile-container">

          {/* Top Hero Banner Card */}
          <div className="profile-hero-card">
            <div className="profile-hero-content">
              
              <div className="profile-avatar-block">
                <img src={photo} alt={displayName} className="freelancer-large-avatar" />
                <span className={`status-badge-dot ${profile?.availability === 'busy' ? 'busy' : 'online'}`} />
              </div>

              <div className="profile-identity-info">
                <div className="identity-title-row">
                  <h1 className="freelancer-name">{displayName}</h1>
                  <span className="verified-badge" title="حساب موثق">
                    <FiCheckCircle /> موثق
                  </span>
                </div>

                <p className="freelancer-job-title">{displayTitle}</p>

                <div className="profile-meta-tags">
                  <span className="meta-tag">
                    <FiMapPin className="meta-icon" />
                    <span>{displayLocation}</span>
                  </span>

                  <span className={`availability-pill ${profile?.availability === 'busy' ? 'busy-pill' : 'avail-pill'}`}>
                    {profile?.availability === 'busy' ? 'مشغول حالياً' : 'متاح للعمل فوراً'}
                  </span>
                </div>
              </div>

              {/* Action Area */}
              <div className="profile-hero-actions">
                {isOwner ? (
                  <button
                    type="button"
                    className="edit-my-profile-btn"
                    onClick={() => navigate('/freelancer/profile/edit')}
                  >
                    <FiEdit />
                    <span>تعديل الملف الشخصي</span>
                  </button>
                ) : (
                  <>
                    {canHire && (
                      <button
                        type="button"
                        className="hire-me-cta-btn"
                        onClick={() => navigate(isAuthenticated ? '/post-project' : '/login?role=client')}
                      >
                        <FiBriefcase />
                        <span>توظيف المستقل</span>
                      </button>
                    )}
                    {canContact && (
                      <button
                        type="button"
                        className="contact-me-btn"
                        onClick={() => navigate(isAuthenticated ? `/messages?userId=${id}` : `/login?role=client&redirect=/freelancers/${id}`)}
                      >
                        <FiMessageSquare />
                        <span>مراسلة</span>
                      </button>
                    )}
                    {canReport && (
                      <button type="button" className="report-link-btn" onClick={() => setReportOpen(true)} disabled={reportSent}>
                        <FiFlag />
                        <span>{reportSent ? 'تم إرسال البلاغ' : 'إبلاغ'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
              <ReportModal
                isOpen={reportOpen}
                targetType="user"
                targetId={id}
                targetLabel={freelancerUser?.fullName}
                onClose={() => setReportOpen(false)}
                onReported={() => setReportSent(true)}
              />

            </div>

            {/* Quick Stats Strip */}
            <div className="profile-stats-strip">
              <div className="stat-box">
                <div className="stat-rating-value">
                  <FiStar className="star-icon" />
                  <span>{reviews.length > 0 ? Number(displayRating).toFixed(1) : '—'}</span>
                </div>
                <span className="stat-label">{reviews.length > 0 ? `تقييم العملاء (${reviews.length} تقييم)` : 'لا توجد تقييمات بعد'}</span>
              </div>

              <div className="stat-divider" />

              <div className="stat-box">
                <span className="stat-number">{completedProjects}</span>
                <span className="stat-label">مشروع مكتمل بنجاح</span>
              </div>

              <div className="stat-divider" />

              <div className="stat-box">
                <span className="stat-number">{freelancerUser?.createdAt ? new Date(freelancerUser.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }) : '—'}</span>
                <span className="stat-label">عضو منذ</span>
              </div>
            </div>

          </div>

          {/* Two-Column Layout */}
          <div className="profile-two-columns">
            
            {/* Right Column: Bio & Portfolio & Reviews */}
            <div className="column-main">
              
              {/* Bio Card */}
              <section className="profile-section-card">
                <h3 className="card-heading">نبذة تعريفية</h3>
                <p className="freelancer-bio-text">{displayBio}</p>
              </section>

              {/* Portfolio Card */}
              <section className="profile-section-card">
                <h3 className="card-heading">معرض الأعمال السابقة</h3>
                {(!profile?.portfolio || profile.portfolio.length === 0) ? (
                  <p className="empty-section-text">لم يقم المستقل بإضافة أعمال إلى المعرض حتى الآن.</p>
                ) : (
                  <div className="portfolio-items-grid">
                    {profile.portfolio.map((item) => (
                      <div key={item.id} className="portfolio-gallery-item">
                        <div className="portfolio-item-content">
                          <h4 className="portfolio-item-title">{item.title}</h4>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="portfolio-external-link"
                            >
                              <span>مشاهدة العمل</span>
                              <FiExternalLink />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Reviews Card */}
              <section className="profile-section-card">
                <h3 className="card-heading">تقييمات وآراء العملاء ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className="empty-section-text">لا توجد تقييمات مسجلة بعد لهذا المستقل.</p>
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

            {/* Left Column: Skills & Badges */}
            <aside className="column-sidebar">
              <div className="profile-section-card">
                <h3 className="card-heading">المهارات والتخصصات</h3>
                {(!profile?.skills || profile.skills.length === 0) ? (
                  <p className="empty-section-text">لم يتم إدراج مهارات.</p>
                ) : (
                  <div className="skills-badge-list">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="profile-skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Trust Box */}
              <div className="profile-section-card trust-card">
                <h4 className="trust-title">ضمان سوداوورك 100%</h4>
                <p className="trust-desc">
                  أموالك في أمان عبر خدمة الضمان، لا يتم تسليم المبالغ للمستقل إلا بعد معاينة المشروع وقبوله نهائياً.
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

export default FreelancerProfile;
