import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import './ExploreCategories.css';
import { api } from '../../../services/api';
import useApiData from '../../../hooks/useApiData';
import ErrorState from '../../../components/common/ErrorState/ErrorState';
import defaultAvatar from '../../../assets/default-avatar.svg';

/**
 * Category explorer: real categories from the API, and the freelancers whose
 * skills belong to the selected category. Each card shows a freelancer's
 * latest portfolio image when they have one.
 */
const ExploreCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: categories } = useApiData(() => api.taxonomy.categories(), [], { initialData: [] });
  const { data: result, loading, error, reload } = useApiData(
    () => api.profiles.searchFreelancers({ category: selectedCategory, limit: 12 }),
    [selectedCategory]
  );
  const freelancers = result?.items || [];

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
            {(categories || []).map((cat) => (
              <li key={cat.id} className="sidebar-category-item">
                <button
                  type="button"
                  className={`sidebar-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Freelancer Cards Grid */}
        <div className="services-grid-container">
          {loading ? (
            <div className="empty-category-notice">
              <p>جارٍ التحميل...</p>
            </div>
          ) : error ? (
            <ErrorState title="تعذر تحميل المستقلين" error={error} onRetry={reload} />
          ) : freelancers.length === 0 ? (
            <div className="empty-category-notice">
              <p>
                {selectedCategory === 'all'
                  ? 'لم ينضم مستقلون إلى المنصة بعد.'
                  : 'لا يوجد مستقلون في هذا التصنيف حالياً.'}
              </p>
              {selectedCategory !== 'all' && (
                <button type="button" className="reset-filter-btn" onClick={() => setSelectedCategory('all')}>
                  عرض كافة التصنيفات
                </button>
              )}
            </div>
          ) : (
            <div className="services-cards-grid">
              {freelancers.map((fl) => (
                <article key={fl.id} className="explore-card">
                  <Link to={`/freelancers/${fl.id}`} className="explore-thumbnail-wrapper">
                    <img
                      src={fl.photo || defaultAvatar}
                      alt={fl.fullName}
                      className="explore-thumbnail-img"
                      loading="lazy"
                    />
                  </Link>

                  <div className="explore-card-content">
                    <div className="explore-card-header-row">
                      <div className="author-info">
                        <img src={fl.photo || defaultAvatar} alt="" className="author-avatar" />
                        <span className="author-name">{fl.fullName}</span>
                      </div>
                      {fl.availability === 'available' && (
                        <span className="recommended-badge badge-recommended">متاح للعمل</span>
                      )}
                    </div>

                    <h3 className="explore-card-title" title={fl.title}>
                      <Link to={`/freelancers/${fl.id}`}>{fl.title || 'مستقل'}</Link>
                    </h3>

                    <div className="explore-card-rating">
                      <FiStar className="star-icon" />
                      {fl.totalReviews > 0 ? (
                        <>
                          <span className="rating-score">{fl.avgRating.toFixed(1)}</span>
                          <span className="reviews-count">({fl.totalReviews})</span>
                        </>
                      ) : (
                        <span className="reviews-count">لا توجد تقييمات بعد</span>
                      )}
                    </div>
                  </div>

                  <div className="explore-card-footer">
                    <div className="footer-price-wrapper">
                      {fl.hourlyRate ? (
                        <>
                          <span className="price-value">{fl.hourlyRate.toLocaleString()} ج.س</span>
                          <span className="price-label">للساعة</span>
                        </>
                      ) : (
                        <span className="price-label">{fl.completedProjects} مشروع منجز</span>
                      )}
                    </div>
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
