import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './ProjectsBrowse.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import useApiData from '../../hooks/useApiData';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { 
  FiSearch, 
  FiFilter, 
  FiClock, 
  FiUser, 
  FiTag, 
  FiArrowLeft,
  FiX,
  FiBriefcase,
  FiCalendar
} from 'react-icons/fi';

const quickKeywords = [
  'تطوير مواقع',
  'تطبيقات جوال',
  'تصميم UI/UX',
  'هوية بصرية',
  'تسويق رقمي',
  'مونتاج فيديو',
  'ذكاء اصطناعي'
];

const PAGE_SIZE = 10;

const ProjectsBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Applied filters come from the URL (shareable, back-button friendly).
  const applied = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    duration: searchParams.get('duration') || 'all',
    sort: searchParams.get('sort') || 'newest',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };

  // Text inputs are edited locally and applied on submit.
  const [searchTerm, setSearchTerm] = useState(applied.search);
  const [minBudget, setMinBudget] = useState(applied.minBudget);
  const [maxBudget, setMaxBudget] = useState(applied.maxBudget);
  const selectedCategory = applied.category;
  const selectedDuration = applied.duration;
  const sortBy = applied.sort;

  // Re-sync the text inputs when the URL changes (back button, chip removal).
  const queryKey = searchParams.toString();
  const [syncedKey, setSyncedKey] = useState(queryKey);
  if (syncedKey !== queryKey) {
    setSyncedKey(queryKey);
    setSearchTerm(applied.search);
    setMinBudget(applied.minBudget);
    setMaxBudget(applied.maxBudget);
  }

  const { data: categories } = useApiData(() => api.taxonomy.categories(), [], { initialData: [] });

  const { data: result, loading, error, reload } = useApiData(
    () =>
      api.projects.browse({
        search: applied.search,
        category: applied.category,
        minBudget: applied.minBudget,
        maxBudget: applied.maxBudget,
        duration: applied.duration,
        sort: applied.sort,
        page: applied.page,
        limit: PAGE_SIZE,
      }),
    [queryKey]
  );
  const sortedProjects = result?.items || [];
  const total = result?.total || 0;
  const totalPages = result?.totalPages || 1;

  // Any filter change returns to page 1.
  const updateUrlParams = (newParams) => {
    const combined = {
      search: applied.search,
      category: applied.category,
      minBudget: applied.minBudget,
      maxBudget: applied.maxBudget,
      duration: applied.duration,
      sort: applied.sort === 'newest' ? '' : applied.sort,
      page: '',
      ...newParams,
    };
    Object.keys(combined).forEach((k) => {
      if (!combined[k] || combined[k] === 'all') delete combined[k];
    });
    setSearchParams(combined);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateUrlParams({ search: searchTerm.trim(), minBudget, maxBudget });
  };

  const handleCategorySelect = (catId) => updateUrlParams({ category: catId });
  const handleQuickKeyword = (kw) => {
    setSearchTerm(kw);
    updateUrlParams({ search: kw });
  };
  const handleDurationSelect = (dur) => updateUrlParams({ duration: dur });
  const handleSortChange = (sortOption) => updateUrlParams({ sort: sortOption === 'newest' ? '' : sortOption });
  const goToPage = (page) => updateUrlParams({ page: page > 1 ? String(page) : '' });

  const handleClearFilters = () => {
    setSearchTerm('');
    setMinBudget('');
    setMaxBudget('');
    setSearchParams({});
  };

  const getCategoryName = (catId) => {
    const c = (categories || []).find((cat) => cat.id === catId);
    return c ? c.name : 'خدمات عامة';
  };

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== 'all') ||
    applied.search ||
    applied.minBudget ||
    applied.maxBudget ||
    (selectedDuration && selectedDuration !== 'all')
  );

  return (
    <div className="projects-browse-page" dir="rtl">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}

      <main className="projects-browse-main">
        <div className="projects-browse-container">
          
          {/* Header Banner */}
          <div className="projects-header-banner">
            <h1 className="browse-title">ابحث عن أحدث مشاريع العمل الحر</h1>
            <p className="browse-subtitle">
              تصفح مئات الفرص والمشاريع اليومية في السودان، قدم عروضك المهنية، واضمن مستحقاتك عبر نظام الضمان البنكي.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="browse-search-form">
              <div className="search-input-wrapper">
                <FiSearch className="search-input-icon" />
                <input
                  type="text"
                  className="browse-search-input"
                  placeholder="ابحث بكلمات مفتاحية، مثل: تطوير موقع ويب، متجر إلكتروني، هوية بصرية، كتابة..."
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
                بحث عن مشاريع
              </button>
            </form>

            {/* Quick Keyword Chips */}
            <div className="quick-keywords-bar">
              <span className="quick-label">الكلمات الأكثر طلباً:</span>
              <div className="keywords-chips">
                {quickKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className={`kw-chip ${searchTerm === kw ? 'active' : ''}`}
                    onClick={() => handleQuickKeyword(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
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
                    التصنيف: {getCategoryName(selectedCategory)}
                    <button type="button" onClick={() => updateUrlParams({ category: 'all' })}><FiX /></button>
                  </span>
                )}
                {(applied.minBudget || applied.maxBudget) && (
                  <span className="filter-tag">
                    الميزانية: {applied.minBudget ? `من ${Number(applied.minBudget).toLocaleString()}` : ''} {applied.maxBudget ? `إلى ${Number(applied.maxBudget).toLocaleString()} ج.س` : ''}
                    <button type="button" onClick={() => updateUrlParams({ minBudget: '', maxBudget: '' })}><FiX /></button>
                  </span>
                )}
                {selectedDuration !== 'all' && (
                  <span className="filter-tag">
                    المدة: {selectedDuration === 'short' ? 'أقل من أسبوع' : selectedDuration === 'medium' ? 'أسبوع إلى شهر' : 'أكثر من شهر'}
                    <button type="button" onClick={() => updateUrlParams({ duration: 'all' })}><FiX /></button>
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

          {/* Main Layout (Sidebar Filters + Results List) */}
          <div className="browse-layout">
            
            {/* Sidebar Filters */}
            <aside className="browse-sidebar">
              <div className="filter-card">
                <div className="filter-card-header">
                  <div className="filter-title">
                    <FiFilter />
                    <span>تصفية المشاريع</span>
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

                {/* Categories Filter */}
                <div className="filter-group">
                  <h4 className="filter-group-title">التصنيف المهني</h4>
                  <ul className="category-filter-list">
                    <li key="all">
                      <button
                        type="button"
                        className={`category-pill-btn ${selectedCategory === 'all' ? 'active-pill' : ''}`}
                        onClick={() => handleCategorySelect('all')}
                      >
                        جميع التصنيفات
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

                {/* Budget Range Filter */}
                <div className="filter-group">
                  <h4 className="filter-group-title">نطاق الميزانية (ج.س)</h4>
                  <div className="budget-range-inputs">
                    <input
                      type="number"
                      className="budget-input"
                      placeholder="الحد الأدنى"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                    <span className="range-sep">-</span>
                    <input
                      type="number"
                      className="budget-input"
                      placeholder="الحد الأقصى"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="apply-filter-btn"
                    onClick={handleSearchSubmit}
                  >
                    تطبيق نطاق الميزانية
                  </button>
                </div>

                {/* Duration Filter */}
                <div className="filter-group">
                  <h4 className="filter-group-title">مدة التنفيذ المتوقعة</h4>
                  <div className="duration-options-list">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedDuration === 'all'}
                        onChange={() => handleDurationSelect('all')}
                      />
                      <span>كافة المدد</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedDuration === 'short'}
                        onChange={() => handleDurationSelect('short')}
                      />
                      <span>أقل من أسبوع</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedDuration === 'medium'}
                        onChange={() => handleDurationSelect('medium')}
                      />
                      <span>من أسبوع إلى شهر</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedDuration === 'long'}
                        onChange={() => handleDurationSelect('long')}
                      />
                      <span>أكثر من شهر</span>
                    </label>
                  </div>
                </div>

              </div>
            </aside>

            {/* Results Section */}
            <section className="browse-results-section">
              <div className="results-status-bar">
                <span className="results-count">
                  {loading ? 'جارٍ تحميل المشاريع...' : error ? '' : `تم العثور على ${total} مشروع متاح`}
                </span>

                <div className="sort-dropdown-box">
                  <label htmlFor="sort-select">الترتيب:</label>
                  <select
                    id="sort-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="newest">الأحدث أولاً</option>
                    <option value="budget_desc">الأعلى ميزانية</option>
                    <option value="budget_asc">الأقل ميزانية</option>
                    <option value="proposals_desc">الأكثر تنافساً وعروضاً</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="browse-loading-state">
                  <div className="browse-spinner" />
                  <p>جارٍ تحميل الفرص المتاحة...</p>
                </div>
              ) : error ? (
                <ErrorState title="تعذر تحميل المشاريع" error={error} onRetry={reload} />
              ) : sortedProjects.length === 0 ? (
                hasActiveFilters ? (
                  <div className="no-results-card">
                    <FiBriefcase className="no-results-icon" />
                    <h3>لا توجد مشاريع مطابقة لخيارات البحث المحددة</h3>
                    <p>جرب تعديل كلمات البحث أو إزالة بعض الفلاتر، أو عد لاحقاً لمشاهدة مشاريع جديدة.</p>
                    <button type="button" className="reset-search-btn" onClick={handleClearFilters}>
                      مسح الفلاتر وعرض كافة المشاريع
                    </button>
                  </div>
                ) : (
                  <div className="no-results-card">
                    <FiBriefcase className="no-results-icon" />
                    <h3>لا توجد مشاريع متاحة حالياً</h3>
                    <p>لم يتم نشر مشاريع مفتوحة بعد. أكمل ملفك المهني الآن لتكون جاهزاً عند نشر المشاريع الجديدة.</p>
                    {isAuthenticated && (
                      <Link to="/freelancer/profile/edit" className="reset-search-btn">
                        تحديث ملفي المهني
                      </Link>
                    )}
                  </div>
                )
              ) : (
                <div className="projects-cards-stack">
                  {sortedProjects.map((project) => {
                    const propCount = project.proposalsCount;
                    return (
                      <article key={project.id} className="project-feed-card">
                        <div className="project-feed-header">
                          <div className="project-title-area">
                            <span className="project-category-badge">
                              <FiTag className="badge-icon" />
                              {project.categoryName || getCategoryName(project.categoryId)}
                            </span>
                            <h2 className="project-feed-title">
                              <Link to={`/projects/${project.id}`} className="project-title-link">
                                {project.title}
                              </Link>
                            </h2>
                          </div>

                          <div className="project-budget-badge">
                            <span className="budget-lbl">الميزانية المقدرة</span>
                            <span className="budget-amt">
                              {`${Number(project.budget || 0).toLocaleString()} ج.س`}
                            </span>
                          </div>
                        </div>

                        <p className="project-feed-desc">{project.description}</p>

                        {/* Skills Chips */}
                        {project.skills && project.skills.length > 0 && (
                          <div className="project-skills-row">
                            {project.skills.map((skill, idx) => (
                              <span key={idx} className="project-skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="project-feed-footer">
                          <div className="project-feed-meta">
                            <div className="meta-info-item">
                              <FiClock className="meta-icon" />
                              <span>
                                {project.duration ? `المتبقي على التسليم: ${project.duration}` : `التسليم: ${project.deadline}`}
                              </span>
                            </div>

                            <div className="meta-info-item">
                              <FiUser className="meta-icon" />
                              <span>{propCount} عرض مقدم</span>
                            </div>

                            <div className="meta-info-item">
                              <FiCalendar className="meta-icon" />
                              <span>نُشر في {new Date(project.createdAt).toLocaleDateString('ar-SD')}</span>
                            </div>
                          </div>

                          <div className="footer-action-right">
                            <Link to={`/projects/${project.id}`} className="apply-project-btn">
                              <span>تقديم عرض</span>
                              <FiArrowLeft className="cta-icon" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
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

export default ProjectsBrowse;
