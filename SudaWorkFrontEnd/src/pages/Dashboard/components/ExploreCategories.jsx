import React, { useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiEyeOff
} from 'react-icons/fi';
import './ExploreCategories.css';

// Import Service Images
import videoUgcImg from '../../../assets/dashboard/video_ugc.jpg';
import marketingAdsImg from '../../../assets/dashboard/marketing_ads.jpg';
import brandingLogoImg from '../../../assets/dashboard/branding_logo.jpg';
import webDevImg from '../../../assets/dashboard/web_dev.jpg';

// Import Avatars
import avatarTasneem from '../../../assets/dashboard/avatar_tasneem.jpg';
import avatarOmar from '../../../assets/dashboard/avatar_omar.jpg';
import avatarRoua from '../../../assets/dashboard/avatar_roua.jpg';
import avatarMohamed from '../../../assets/dashboard/avatar_mohamed.jpg';

const categoriesSidebar = [
  { id: 'web', title: 'تصميم المواقع' },
  { id: 'identity', title: 'تصميم الهوية البصرية' },
  { id: 'video', title: 'إنتاج الفيديوهات' },
  { id: 'other', title: 'خدمات إلكترونية أخرى' },
];

const initialServices = [
  {
    id: 1,
    category: 'ugc',
    image: videoUgcImg,
    badge: 'موصى به',
    badgeType: 'recommended',
    freelancer: {
      name: 'تسنيم الطيب',
      avatar: avatarTasneem,
    },
    title: 'إنتاج وتعديل فيديو تسويقي احترافي لخدمتك أو منتجك (UGC) بجودة سينمائية',
    rating: '5.0',
    reviewsCount: '42',
    price: '1,500',
  },
  {
    id: 2,
    category: 'social',
    image: marketingAdsImg,
    badge: null,
    freelancer: {
      name: 'عمر فاروق',
      avatar: avatarOmar,
    },
    title: 'إدارة الحملات الإعلانية الاحترافية على منصات التواصل الاجتماعي لزيادة مبيعاتك',
    rating: '4.8',
    reviewsCount: '65',
    price: '920',
  },
  {
    id: 3,
    category: 'logo',
    image: brandingLogoImg,
    badge: 'أعلى تقييماً',
    badgeType: 'top-rated',
    freelancer: {
      name: 'رؤى أحمد',
      avatar: avatarRoua,
    },
    title: 'سأصمم الهوية البصرية والشعار الاحترافي لشركتك الناشئة بدقة وبأفكار مبتكرة',
    rating: '5.0',
    reviewsCount: '98',
    price: '1,850',
  },
  {
    id: 4,
    category: 'web',
    image: webDevImg,
    badge: null,
    freelancer: {
      name: 'محمد عثمان',
      avatar: avatarMohamed,
    },
    title: 'سأقوم بتطوير متجر إلكتروني متكامل متجاوب مع جميع الشاشات باستخدام React',
    rating: '4.9',
    reviewsCount: '140',
    price: '3,200',
  },
];

const ExploreCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState(initialServices);
  const [hiddenIds, setHiddenIds] = useState([]);

  const handleHideService = (id, e) => {
    e.stopPropagation();
    setHiddenIds((prev) => [...prev, id]);
  };

  const filteredServices = services.filter((s) => {
    if (hiddenIds.includes(s.id)) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'ugc') return s.category === 'ugc';
    if (selectedCategory === 'web') return s.category === 'web';
    if (selectedCategory === 'identity') return s.category === 'identity' || s.category === 'logo';
    if (selectedCategory === 'video') return s.category === 'video' || s.category === 'ugc';
    if (selectedCategory === 'other') return s.category === 'other' || s.category === 'social';
    return true;
  });

  return (
    <section className="explore-categories-section" dir="rtl">
      {/* Section Header */}
      <div className="explore-header">
        <h2 className="explore-title">
          استكشف التصنيفات الشائعة على سوداوورك
        </h2>
        <div className="explore-nav-actions">
          <button 
            type="button" 
            className={`explore-view-all-btn ${selectedCategory === 'all' ? 'active-view-all' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            عرض الكل
          </button>
        </div>
      </div>

      {/* Main Content Layout: Right Sidebar + Grid of Cards */}
      <div className="explore-content-layout">

        {/* Right Sidebar: Categories Filter */}
        <aside className="explore-sidebar">
          <ul className="sidebar-categories-list">
            <li className="sidebar-category-item">
              <button
                type="button"
                className={`sidebar-category-btn highlight-btn ${selectedCategory === 'ugc' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ugc')}
              >
                المحتوى من إنشاء المستخدمين (UGC)
              </button>
            </li>
            {categoriesSidebar.map((cat) => (
              <li key={cat.id} className="sidebar-category-item">
                <button
                  type="button"
                  className={`sidebar-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Services Cards Grid (4 Columns) */}
        <div className="services-grid-container">
          {filteredServices.length === 0 ? (
            <div className="empty-category-notice">
              <p>لا توجد خدمات متاحة حالياً في هذا التصنيف.</p>
              <button 
                type="button" 
                className="reset-filter-btn"
                onClick={() => { setSelectedCategory('all'); setHiddenIds([]); }}
              >
                إعادة ضبط التصنيفات
              </button>
            </div>
          ) : (
            <div className="services-cards-grid">
              {filteredServices.map((service) => (
                <article key={service.id} className="explore-card">
                  {/* Thumbnail */}
                  <div className="explore-thumbnail-wrapper">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="explore-thumbnail-img"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="explore-card-content">
                    {/* Header Row */}
                    <div className="explore-card-header-row">
                      <div className="author-info">
                        <img
                          src={service.freelancer.avatar}
                          alt={service.freelancer.name}
                          className="author-avatar"
                        />
                        <span className="author-name">{service.freelancer.name}</span>
                      </div>
                      {service.badge && (
                        <span className={`recommended-badge badge-${service.badgeType}`}>
                          {service.badge}
                        </span>
                      )}
                    </div>

                    {/* Service Title */}
                    <h3 className="explore-card-title" title={service.title}>
                      {service.title}
                    </h3>

                    {/* Rating */}
                    <div className="explore-card-rating">
                      <FiStar className="star-icon" />
                      <span className="rating-score">{service.rating}</span>
                      <span className="reviews-count">({service.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="explore-card-footer">
                    <div className="footer-price-wrapper">
                      <span className="price-value">{service.price} ج.س</span>
                      <span className="price-label">تبدأ من</span>
                    </div>
                    <button 
                      type="button" 
                      className="footer-icon-wrapper"
                      onClick={(e) => handleHideService(service.id, e)}
                      title="إخفاء هذه الخدمة"
                    >
                      <FiEyeOff className="hide-icon" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>


      </div>
    </section>
  );
};

export default ExploreCategories;
