import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiStar,
  FiMapPin,
  FiBriefcase,
  FiArrowLeft,
  FiCheckCircle,
  FiSearch
} from 'react-icons/fi';
import './ClientTalentDiscovery.css';
import defaultAvatar from '../../../assets/default-avatar.svg';

const talentCategories = [
  { id: 'all', label: 'كافة التخصصات' },
  { id: 'dev', label: 'تطوير وبرمجة' },
  { id: 'design', label: 'تصميم وهوية بصرية' },
  { id: 'marketing', label: 'تسويق رقمي وإعلانات' },
  { id: 'writing', label: 'كتابة ومحتوى' }
];

const ClientTalentDiscovery = ({ freelancers = [], loading = false }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFreelancers = freelancers.filter((f) => {
    if (activeCategory === 'all') return true;
    const cat = f.category?.toLowerCase() || '';
    const title = f.title?.toLowerCase() || '';
    const skills = (f.skills || []).map(s => s.toLowerCase());

    if (activeCategory === 'dev') {
      return cat.includes('dev') || cat.includes('برمج') || title.includes('مطور') || title.includes('برمج') || skills.some(s => s.includes('react') || s.includes('web') || s.includes('تطوير'));
    }
    if (activeCategory === 'design') {
      return cat.includes('design') || cat.includes('تصميم') || title.includes('مصمم') || skills.some(s => s.includes('ui') || s.includes('شعار') || s.includes('تصميم'));
    }
    if (activeCategory === 'marketing') {
      return cat.includes('market') || cat.includes('تسويق') || title.includes('تسويق') || skills.some(s => s.includes('إعلان') || s.includes('seo') || s.includes('تسويق'));
    }
    if (activeCategory === 'writing') {
      return cat.includes('writ') || cat.includes('كتابة') || title.includes('كاتب') || title.includes('مترجم') || skills.some(s => s.includes('محتوى') || s.includes('ترجمة'));
    }
    return true;
  });

  return (
    <section className="client-talent-discovery-section" dir="rtl">
      <div className="discovery-header">
        <div>
          <div className="discovery-tag">
            <FiCheckCircle className="tag-icon" />
            <span>نخبة المواهب المعتمدة</span>
          </div>
          <h2 className="discovery-title">استكشف ووظف أفضل المستقلين السودانيين</h2>
          <p className="discovery-subtitle">
            تصفح ملفات المحترفين أصحاب التقييمات العالية وتواصل معهم مباشرة لتنفيذ مشاريعك.
          </p>
        </div>

        <Link to="/freelancers" className="btn-browse-all-freelancers">
          <span>دليل المستقلين الكامل</span>
          <FiArrowLeft />
        </Link>
      </div>

      {/* Categories Filter Tabs */}
      <div className="talent-filter-tabs">
        <div className="filter-pills-row">
          {talentCategories.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`talent-pill-btn ${activeCategory === tab.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="talent-loading-box">
          <div className="talent-spinner" />
          <p>جارٍ تحميل أفضل الكفاءات والمستقلين...</p>
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="talent-empty-box">
          <FiSearch className="empty-search-icon" />
          <p>{freelancers.length === 0 ? 'لم ينضم مستقلون إلى المنصة بعد.' : 'لا يوجد مستقلون متطابقون مع هذا التصنيف حالياً.'}</p>
          {freelancers.length > 0 && (
            <button
              type="button"
              className="btn-reset-category"
              onClick={() => setActiveCategory('all')}
            >
              عرض كافة التخصصات
            </button>
          )}
        </div>
      ) : (
        <div className="talent-cards-grid">
          {filteredFreelancers.slice(0, 4).map((freelancer) => {
            const ratingFormatted = Number(freelancer.avgRating || 0).toFixed(1);
            const reviews = freelancer.totalReviews;

            return (
              <div key={freelancer.id || freelancer.userId} className="freelancer-talent-card">
                <div className="card-talent-header">
                  <div className="talent-avatar-box">
                    <img
                      src={freelancer.photo || defaultAvatar}
                      alt={freelancer.fullName}
                      className="talent-avatar-img"
                    />
                    {freelancer.availability === 'available' && (
                      <span className="talent-online-badge" title="متاح للعمل" />
                    )}
                  </div>

                  <div className="talent-meta-info">
                    <h3 className="talent-name">
                      <Link to={`/freelancers/${freelancer.id || freelancer.userId}`}>
                        {freelancer.fullName}
                      </Link>
                    </h3>
                    <p className="talent-title">{freelancer.title || 'مستقل'}</p>
                    
                    <div className="talent-location-rating">
                      <span className="talent-rating">
                        <FiStar className="star-icon" />
                        {reviews > 0 ? (
                          <>
                            <strong>{ratingFormatted}</strong>
                            <span className="rating-count">({reviews})</span>
                          </>
                        ) : (
                          <span className="rating-count">جديد</span>
                        )}
                      </span>
                      {freelancer.location && (
                        <span className="talent-location">
                          <FiMapPin className="pin-icon" />
                          <span>{freelancer.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {freelancer.bio && (
                  <p className="talent-bio-text">
                    {freelancer.bio.length > 95 ? freelancer.bio.substring(0, 95) + '...' : freelancer.bio}
                  </p>
                )}

                {/* Skills Chips */}
                <div className="talent-skills-wrap">
                  {(freelancer.skills || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="talent-skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="talent-card-footer">
                  <div className="completed-projects-count">
                    <FiBriefcase className="brief-icon" />
                    <span>{freelancer.completedProjects} مشروع منجز</span>
                  </div>

                  <Link
                    to={`/freelancers/${freelancer.id || freelancer.userId}`}
                    className="btn-hire-talent"
                  >
                    <span>عرض الملف</span>
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

export default ClientTalentDiscovery;
