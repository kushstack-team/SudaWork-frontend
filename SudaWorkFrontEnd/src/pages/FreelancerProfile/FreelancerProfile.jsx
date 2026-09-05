import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './FreelancerProfile.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
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

const FreelancerProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [freelancerUser, setFreelancerUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.id === id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const u = await mockApi.users.getById(id);
        const p = await mockApi.profiles.getFreelancerProfile(id);
        const r = await mockApi.reviews.getByUser(id);

        setFreelancerUser(u);
        setProfile(p);
        setReviews(r || []);
      } catch (err) {
        console.error('Failed to load freelancer profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="freelancer-view-loading" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل ملف المستقل...</p>
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

  const displayName = freelancerUser?.fullName || 'مستقل في سوداوورك';
  const displayTitle = profile?.title || 'مستقل محترف';
  const displayLocation = profile?.location || 'السودان';
  const displayBio = profile?.bio || 'لم تتم إضافة نبذة شخصية بعد.';
  const displayRating = profile?.avgRating || 5.0;
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
                    <button
                      type="button"
                      className="hire-me-cta-btn"
                      onClick={() => navigate('/post-project')}
                    >
                      <FiBriefcase />
                      <span>توظيف المستقل</span>
                    </button>
                    <button
                      type="button"
                      className="contact-me-btn"
                      onClick={() => navigate('/messages')}
                    >
                      <FiMessageSquare />
                      <span>مراسلة</span>
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* Quick Stats Strip */}
            <div className="profile-stats-strip">
              <div className="stat-box">
                <div className="stat-rating-value">
                  <FiStar className="star-icon" />
                  <span>{Number(displayRating).toFixed(1)}</span>
                </div>
                <span className="stat-label">تقييم العملاء ({reviews.length} تقييم)</span>
              </div>

              <div className="stat-divider" />

              <div className="stat-box">
                <span className="stat-number">{completedProjects}</span>
                <span className="stat-label">مشروع مكتمل بنجاح</span>
              </div>

              <div className="stat-divider" />

              <div className="stat-box">
                <span className="stat-number">100%</span>
                <span className="stat-label">نسبة الالتزام بالمواعيد</span>
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
                          {item.link && item.link !== '#' && (
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
                        <p className="review-comment">{rev.comment}</p>
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
