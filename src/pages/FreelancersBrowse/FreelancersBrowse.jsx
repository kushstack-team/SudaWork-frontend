import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './FreelancersBrowse.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import useApiData from '../../hooks/useApiData';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import defaultAvatar from '../../assets/default-avatar.svg';
import {
  FiSearch,
  FiStar,
  FiMapPin,
  FiFilter,
  FiArrowLeft,
  FiUserCheck,
  FiX,
  FiBriefcase
} from 'react-icons/fi';

const sudanLocations = [
  'الجميع',
  'الخرطوم',
  'أم درمان',
  'بحري',
  'بورتسودان',
  'ود مدني',
  'عطبرة',
  'كسلا'
];

const PAGE_SIZE = 12;

const FreelancersBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Applied filters live in the URL; the server does the filtering and sorting.
  const applied = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minRating: searchParams.get('minRating') || 'all',
    availability: searchParams.get('availability') || 'all',
    location: searchParams.get('location') || 'all',
    sort: searchParams.get('sort') || 'rating_desc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };
  const selectedCategory = applied.category;
  const minRating = applied.minRating;
  const availability = applied.availability;
  const location = applied.location;
  const sortBy = applied.sort;

  const queryKey = searchParams.toString();
  const [searchTerm, setSearchTerm] = useState(applied.search);
  const [syncedKey, setSyncedKey] = useState(queryKey);
  if (syncedKey !== queryKey) {
    setSyncedKey(queryKey);
    setSearchTerm(applied.search);
  }

  const { data: categories } = useApiData(() => api.taxonomy.categories(), [], { initialData: [] });
  const { data: result, loading, error, reload } = useApiData(
    () =>
      api.profiles.searchFreelancers({
        search: applied.search,
        category: applied.category,
        rating: applied.minRating,
        availability: applied.availability,
        location: applied.location === 'الجميع' ? '' : applied.location,
        sort: applied.sort,
        page: applied.page,
        limit: PAGE_SIZE,
      }),
    [queryKey]
  );
  const sortedFreelancers = result?.items || [];
  const total = result?.total || 0;
  const totalPages = result?.totalPages || 1;

  const updateUrlParams = (newParams) => {
    const combined = {
      search: applied.search,
      category: applied.category,
      minRating: applied.minRating,
      availability: applied.availability,
      location: applied.location,
      sort: applied.sort === 'rating_desc' ? '' : applied.sort,
      page: '',
      ...newParams,
    };
    Object.keys(combined).forEach((k) => {
      if (!combined[k] || combined[k] === 'all' || combined[k] === 'الجميع') delete combined[k];
    });
    setSearchParams(combined);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateUrlParams({ search: searchTerm.trim() });
  };
  const handleCategorySelect = (catId) => updateUrlParams({ category: catId });
  const handleRatingSelect = (rating) => updateUrlParams({ minRating: rating });
  const handleAvailabilitySelect = (avail) => updateUrlParams({ availability: avail });
  const handleLocationSelect = (loc) => updateUrlParams({ location: loc });
  const handleSortChange = (sortOption) => updateUrlParams({ sort: sortOption === 'rating_desc' ? '' : sortOption });
  const goToPage = (page) => updateUrlParams({ page: page > 1 ? String(page) : '' });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    applied.search || selectedCategory !== 'all' || minRating !== 'all' || availability !== 'all' || (location !== 'all' && location !== 'الجميع')
  );

  const getCategoryName = (catId) => {
    const c = (categories || []).find((cat) => cat.id === catId);
    return c ? c.name : 'تخصص عام';
  };

  return (
    <div className="freelancers-browse-page" dir="rtl">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}

      <main className="freelancers-browse-main">
        <div className="freelancers-browse-container">
          
          {/* Header Banner */}
          <div className="freelancers-header-banner">
            <h1 className="browse-title">اكتشف أفضل الكفاءات المستقلة في السودان</h1>
            <p className="browse-subtitle">
              تصفح نخبة من أميز المواهب المستقلة المعتمدة في مجالات البرمجة، التصميم، التسويق، وصناعة المحتوى، وتواصل معهم مباشرة.
            </p>

            <form onSubmit={handleSearchSubmit} className="browse-search-form">
              <div className="search-input-wrapper">
                <FiSearch className="search-input-icon" />
                <input
                  type="text"
                  className="browse-search-input"
                  placeholder="ابحث باسم المستقل، التخصص، أو المهارة (مثل: تسنيم، Figma، فيديو، React)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => {
                      setSearchTerm('');
                      updateUrlParams({ search: '' });
                    }}
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <button type="submit" className="browse-search-submit-btn">
                بحث عن مستقلين
              </button>
            </form>
          </div>

          {/* Active Filter Tags Bar */}
          {hasActiveFilters && (
            <div className="active-filter-tags-strip">
              <span className="tags-label">الفلاتر المطبقة:</span>
              <div className="tags-list">
                {applied.search && (
                  <span className="filter-tag">
                    بحث: "{applied.search}"
                    <button type="button" onClick={() => updateUrlParams({ search: '' })}><FiX /></button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="filter-tag">
                    التخصص: {getCategoryName(selectedCategory)}
                    <button type="button" onClick={() => updateUrlParams({ category: 'all' })}><FiX /></button>
                  </span>
                )}
                {minRating !== 'all' && (
                  <span className="filter-tag">
                    التقييم: ⭐ {minRating}+ نجوم
                    <button type="button" onClick={() => updateUrlParams({ minRating: 'all' })}><FiX /></button>
                  </span>
                )}
                {availability !== 'all' && (
                  <span className="filter-tag">
                    الحالة: {availability === 'available' ? 'متاح فوراً' : 'مشغول'}
                    <button type="button" onClick={() => updateUrlParams({ availability: 'all' })}><FiX /></button>
                  </span>
                )}
                {location !== 'all' && location !== 'الجميع' && (
                  <span className="filter-tag">
                    المدينة: {location}
                    <button type="button" onClick={() => updateUrlParams({ location: 'all' })}><FiX /></button>
                  </span>
                )}
                <button
                  type="button"
                  className="clear-all-tags-btn"
                  onClick={handleClearFilters}
                >
                  مسح كافة الفلاتر
                </button>
              </div>
            </div>
          )}

          {/* Main Layout (Sidebar Filters + Freelancers Grid) */}
          <div className="browse-layout">
            
            {/* Sidebar Filters */}
            <aside className="browse-sidebar">
              <div className="filter-card">
                <div className="filter-card-header">
                  <div className="filter-title">
                    <FiFilter />
                    <span>تصفية المستقلين</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={handleClearFilters}
                    >
                      <FiX /> إعادة ضبط
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="filter-group">
                  <h4 className="filter-group-title">المجال المهني</h4>
                  <ul className="category-filter-list">
                    <li key="all">
                      <button
                        type="button"
                        className={`category-pill-btn ${selectedCategory === 'all' ? 'active-pill' : ''}`}
                        onClick={() => handleCategorySelect('all')}
                      >
                        جميع المجالات
                      </button>
                    </li>
                    {(categories || []).map((cat) => (
                      <li key={cat.id}>
                        <button
                          type="button"
                          className={`category-pill-btn ${selectedCategory === cat.id ? 'active-pill' : ''}`}
                          onClick={() => handleCategorySelect(cat.id)}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rating Filter */}
                <div className="filter-group">
                  <h4 className="filter-group-title">التقييم الأدنى</h4>
                  <div className="rating-options-list">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === 'all'}
                        onChange={() => handleRatingSelect('all')}
                      />
                      <span>كافة التقييمات</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === '4.8'}
                        onChange={() => handleRatingSelect('4.8')}
                      />
                      <span className="rating-span">⭐ 4.8 وأعلى</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === '4.5'}
                        onChange={() => handleRatingSelect('4.5')}
                      />
                      <span className="rating-span">⭐ 4.5 وأعلى</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === '4.0'}
                        onChange={() => handleRatingSelect('4.0')}
                      />
                      <span className="rating-span">⭐ 4.0 وأعلى</span>
                    </label>
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="filter-group">
                  <h4 className="filter-group-title">جاهزية العمل</h4>
                  <div className="duration-options-list">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === 'all'}
                        onChange={() => handleAvailabilitySelect('all')}
                      />
                      <span>الجميع</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === 'available'}
                        onChange={() => handleAvailabilitySelect('available')}
                      />
                      <span className="text-success font-bold">🟢 متاح للعمل فوراً</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === 'busy'}
                        onChange={() => handleAvailabilitySelect('busy')}
                      />
                      <span>مشغول حالياً</span>
                    </label>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="filter-group">
                  <h4 className="filter-group-title">المدينة / الولاية</h4>
                  <select
                    className="location-select"
                    value={location}
                    onChange={(e) => handleLocationSelect(e.target.value)}
                  >
                    {sudanLocations.map((loc) => (
                      <option key={loc} value={loc === 'الجميع' ? 'all' : loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </aside>

            {/* Results Grid Section */}
            <section className="browse-results-section">
              <div className="results-status-bar">
                <span className="results-count">
                  {loading ? 'جارٍ تحميل المستقلين...' : error ? '' : `تم العثور على ${total} مستقل`}
                </span>

                <div className="sort-dropdown-box">
                  <label htmlFor="sort-fl-select">الترتيب:</label>
                  <select
                    id="sort-fl-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="rating_desc">الأعلى تقييماً</option>
                    <option value="completed_desc">الأكثر مشاريع منجزة</option>
                    <option value="name_asc">الاسم (أبجدي)</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="browse-loading-state">
                  <div className="browse-spinner" />
                  <p>جارٍ استعراض المستقلين المتاحين...</p>
                </div>
              ) : error ? (
                <ErrorState title="تعذر تحميل المستقلين" error={error} onRetry={reload} />
              ) : sortedFreelancers.length === 0 ? (
                hasActiveFilters ? (
                  <div className="no-results-card">
                    <FiUserCheck className="no-results-icon" />
                    <h3>لا يوجد مستقلون مطابقون لشروط التصفية</h3>
                    <p>جرب البحث بكلمات أخرى أو تقليل شروط الفلاتر لعرض المزيد من الكفاءات.</p>
                    <button type="button" className="reset-search-btn" onClick={handleClearFilters}>
                      مسح الفلاتر وعرض كافة المستقلين
                    </button>
                  </div>
                ) : (
                  <div className="no-results-card">
                    <FiUserCheck className="no-results-icon" />
                    <h3>لم ينضم مستقلون إلى المنصة بعد</h3>
                    <p>{isAuthenticated ? 'يمكنك نشر مشروعك الآن وسيتمكن المستقلون من تقديم عروضهم عند انضمامهم.' : 'كن أول المستقلين المنضمين إلى سوداوورك.'}</p>
                    <Link to={isAuthenticated ? '/post-project' : '/register/freelancer'} className="reset-search-btn">
                      {isAuthenticated ? 'نشر مشروع' : 'انضم كمستقل'}
                    </Link>
                  </div>
                )
              ) : (
                <div className="freelancers-grid">
                  {sortedFreelancers.map((freelancer) => (
                    <div key={freelancer.id} className="freelancer-card">
                      <div className="freelancer-card-header">
                        <div className="avatar-wrapper">
                          <img 
                            src={freelancer.photo || defaultAvatar} 
                            alt={freelancer.fullName}
                            className="freelancer-avatar-img"
                            onError={(e) => { e.target.src = defaultAvatar; }}
                          />
                          <span className={`status-indicator ${freelancer.availability === 'available' ? 'online' : 'busy'}`} />
                        </div>
                        <div className="freelancer-main-info">
                          <h3 className="freelancer-name">
                            <Link to={`/freelancers/${freelancer.id}`}>
                              {freelancer.fullName}
                            </Link>
                          </h3>
                          <p className="freelancer-title-text">{freelancer.title}</p>
                          <div className="freelancer-meta-row">
                            <span className="rating-badge">
                              <FiStar className="star-icon" />
                              <span>{freelancer.totalReviews > 0 ? `${Number(freelancer.avgRating).toFixed(1)} (${freelancer.totalReviews})` : 'جديد'}</span>
                            </span>
                            {freelancer.location && (
                              <span className="location-tag">
                                <FiMapPin className="pin-icon" />
                                <span>{freelancer.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {freelancer.bio && <p className="freelancer-bio-snippet">{freelancer.bio}</p>}

                      {/* Skills Tags */}
                      <div className="freelancer-skills-wrap">
                        {(freelancer.skills || []).slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="skill-pill">
                            {skill}
                          </span>
                        ))}
                        {(freelancer.skills || []).length > 4 && (
                          <span className="skill-pill more">
                            +{(freelancer.skills.length - 4)}
                          </span>
                        )}
                      </div>

                      <div className="freelancer-card-footer">
                        <div className="completed-stats">
                          <FiBriefcase className="briefcase-icon" />
                          <span>{freelancer.completedProjects || 0} مشاريع منجزة</span>
                        </div>
                        <Link to={`/freelancers/${freelancer.id}`} className="view-profile-btn">
                          <span>عرض الملف</span>
                          <FiArrowLeft />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {totalPages > 1 && (
                    <nav className="browse-pagination" aria-label="التنقل بين الصفحات">
                      <button type="button" className="pager-btn" disabled={applied.page <= 1} onClick={() => goToPage(applied.page - 1)}>
                        السابق
                      </button>
                      <span className="pager-status">صفحة {applied.page} من {totalPages}</span>
                      <button type="button" className="pager-btn" disabled={applied.page >= totalPages} onClick={() => goToPage(applied.page + 1)}>
                        التالي
                      </button>
                    </nav>
                  )}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancersBrowse;
