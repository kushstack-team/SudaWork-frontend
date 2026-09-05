import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './FreelancersBrowse.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
import { 
  FiSearch, 
  FiStar, 
  FiMapPin, 
  FiCheckCircle, 
  FiFilter, 
  FiArrowLeft,
  FiUserCheck,
  FiX,
  FiBriefcase,
  FiAward,
  FiClock
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

const FreelancersBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [freelancers, setFreelancers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States synced with URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || 'all');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating_desc');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, fls] = await Promise.all([
          mockApi.categories.getAll(),
          mockApi.profiles.getAllFreelancers(),
        ]);

        setCategories(cats || []);
        setFreelancers(fls || []);
      } catch (err) {
        console.error('Failed to load freelancers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setMinRating(searchParams.get('minRating') || 'all');
    setAvailability(searchParams.get('availability') || 'all');
    setLocation(searchParams.get('location') || 'all');
    setSortBy(searchParams.get('sort') || 'rating_desc');
  }, [searchParams]);

  // Helper to update URL params
  const updateUrlParams = (newParams) => {
    const current = {};
    if (searchTerm.trim()) current.search = searchTerm.trim();
    if (selectedCategory !== 'all') current.category = selectedCategory;
    if (minRating !== 'all') current.minRating = minRating;
    if (availability !== 'all') current.availability = availability;
    if (location !== 'all') current.location = location;
    if (sortBy !== 'rating_desc') current.sort = sortBy;

    const combined = { ...current, ...newParams };
    Object.keys(combined).forEach((k) => {
      if (!combined[k] || combined[k] === 'all') delete combined[k];
    });

    setSearchParams(combined);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateUrlParams({ search: searchTerm.trim() });
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    updateUrlParams({ category: catId });
  };

  const handleRatingSelect = (rating) => {
    setMinRating(rating);
    updateUrlParams({ minRating: rating });
  };

  const handleAvailabilitySelect = (avail) => {
    setAvailability(avail);
    updateUrlParams({ availability: avail });
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    updateUrlParams({ location: loc });
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    updateUrlParams({ sort: sortOption });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinRating('all');
    setAvailability('all');
    setLocation('all');
    setSortBy('rating_desc');
    setSearchParams({});
  };

  // Filtration logic
  const filteredFreelancers = freelancers.filter((fl) => {
    // 1. Search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchName = fl.fullName?.toLowerCase().includes(q);
      const matchTitle = fl.title?.toLowerCase().includes(q);
      const matchSkills = fl.skills?.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchSkills) return false;
    }

    // 2. Category
    if (selectedCategory !== 'all') {
      const catObj = categories.find((c) => c.id === selectedCategory);
      if (catObj) {
        const catName = catObj.name.toLowerCase();
        const matchTitle = fl.title?.toLowerCase().includes(catName);
        const matchSkills = fl.skills?.some((s) => s.toLowerCase().includes(catName));
        if (!matchTitle && !matchSkills) return false;
      }
    }

    // 3. Minimum Rating
    if (minRating !== 'all') {
      const targetRating = Number(minRating);
      if ((fl.avgRating || 5.0) < targetRating) return false;
    }

    // 4. Availability
    if (availability !== 'all') {
      if (fl.availability !== availability) return false;
    }

    // 5. Location
    if (location !== 'all' && location !== 'الجميع') {
      const flLoc = fl.location || '';
      if (!flLoc.includes(location)) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    if (sortBy === 'rating_desc') {
      return (b.avgRating || 0) - (a.avgRating || 0);
    }
    if (sortBy === 'completed_desc') {
      return (b.completedProjects || 0) - (a.completedProjects || 0);
    }
    if (sortBy === 'name_asc') {
      return (a.fullName || '').localeCompare(b.fullName || '', 'ar');
    }
    return 0;
  });

  const getCategoryName = (catId) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.name : 'تخصص عام';
  };

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== 'all') ||
    searchTerm.trim() ||
    (minRating && minRating !== 'all') ||
    (availability && availability !== 'all') ||
    (location && location !== 'all' && location !== 'الجميع')
  );

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
                {searchTerm && (
                  <span className="filter-tag">
                    بحث: "{searchTerm}"
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
                    {categories.map((cat) => (
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
                  {loading ? 'جارٍ تحميل المستقلين...' : `تم العثور على ${sortedFreelancers.length} مستقل محترف`}
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
              ) : sortedFreelancers.length === 0 ? (
                <div className="no-results-card">
                  <FiUserCheck className="no-results-icon" />
                  <h3>لا يوجد مستقلون مطابقون لشروط التصفية</h3>
                  <p>جرب البحث بكلمات أخرى أو تقليل شروط الفلاتر لعرض المزيد من الكفاءات.</p>
                  <button
                    type="button"
                    className="reset-search-btn"
                    onClick={handleClearFilters}
                  >
                    عرض كافة المستقلين
                  </button>
                </div>
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
                              <span>{freelancer.avgRating ? Number(freelancer.avgRating).toFixed(1) : '5.0'}</span>
                            </span>
                            <span className="location-tag">
                              <FiMapPin className="pin-icon" />
                              <span>{freelancer.location || 'السودان'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="freelancer-bio-snippet">
                        {freelancer.bio || 'مستقل محترف متخصص في تقديم خدمات عالية الجودة في منصة سوداوورك.'}
                      </p>

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
