import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './ProjectsBrowse.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { 
  FiSearch, 
  FiFilter, 
  FiClock, 
  FiDollarSign, 
  FiUser, 
  FiTag, 
  FiArrowLeft,
  FiX,
  FiBriefcase,
  FiTrendingUp,
  FiCalendar,
  FiCheck
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

const ProjectsBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If a client accesses the projects filter page, redirect them to their projects management page
  useEffect(() => {
    if (isAuthenticated && user?.role === 'client') {
      navigate('/client/projects', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [proposalsMap, setProposalsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter States synced with URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minBudget, setMinBudget] = useState(searchParams.get('minBudget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('maxBudget') || '');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('duration') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, projs] = await Promise.all([
          mockApi.categories.getAll(),
          mockApi.projects.getAll({ status: 'Open' }),
        ]);

        setCategories(cats || []);
        setProjects(projs || []);

        // Proposal count mapping
        const propCounts = {};
        for (const p of projs) {
          const props = await mockApi.proposals.getByProject(p.id);
          propCounts[p.id] = props.length;
        }
        setProposalsMap(propCounts);
      } catch (err) {
        console.error('Failed to load projects:', err);
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
    setMinBudget(searchParams.get('minBudget') || '');
    setMaxBudget(searchParams.get('maxBudget') || '');
    setSelectedDuration(searchParams.get('duration') || 'all');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Update URL params helper
  const updateUrlParams = (newParams) => {
    const current = {};
    if (searchTerm.trim()) current.search = searchTerm.trim();
    if (selectedCategory !== 'all') current.category = selectedCategory;
    if (minBudget) current.minBudget = minBudget;
    if (maxBudget) current.maxBudget = maxBudget;
    if (selectedDuration !== 'all') current.duration = selectedDuration;
    if (sortBy !== 'newest') current.sort = sortBy;

    const combined = { ...current, ...newParams };
    // Remove empty keys
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

  const handleQuickKeyword = (kw) => {
    setSearchTerm(kw);
    updateUrlParams({ search: kw });
  };

  const handleDurationSelect = (dur) => {
    setSelectedDuration(dur);
    updateUrlParams({ duration: dur });
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    updateUrlParams({ sort: sortOption });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinBudget('');
    setMaxBudget('');
    setSelectedDuration('all');
    setSortBy('newest');
    setSearchParams({});
  };

  // Filtration logic
  const filteredProjects = projects.filter((p) => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    // 2. Min Budget Filter
    if (minBudget && Number(p.budgetMin || p.budget) < Number(minBudget)) {
      return false;
    }

    // 3. Max Budget Filter
    if (maxBudget && Number(p.budgetMax || p.budget) > Number(maxBudget)) {
      return false;
    }

    // 4. Duration Filter
    if (selectedDuration !== 'all') {
      const pDur = (p.duration || '').toLowerCase();
      if (selectedDuration === 'short' && !pDur.includes('يوم') && !pDur.includes('أسبوع') && !pDur.includes('اسبوع')) {
        return false;
      }
      if (selectedDuration === 'medium' && !pDur.includes('شهر') && !pDur.includes('اسبوعين') && !pDur.includes('أسبوعين')) {
        return false;
      }
    }

    // 5. Search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchSkills = p.skills?.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkills) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === 'budget_desc') {
      const bVal = Number(b.budgetMax || b.budget || 0);
      const aVal = Number(a.budgetMax || a.budget || 0);
      return bVal - aVal;
    }
    if (sortBy === 'budget_asc') {
      const bVal = Number(b.budgetMin || b.budget || 0);
      const aVal = Number(a.budgetMin || a.budget || 0);
      return aVal - bVal;
    }
    if (sortBy === 'proposals_desc') {
      const bProps = proposalsMap[b.id] || 0;
      const aProps = proposalsMap[a.id] || 0;
      return bProps - aProps;
    }
    return 0;
  });

  const getCategoryName = (catId) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.name : 'خدمات عامة';
  };

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== 'all') ||
    searchTerm.trim() ||
    minBudget ||
    maxBudget ||
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
                {searchTerm && (
                  <span className="filter-tag">
                    بحث: "{searchTerm}"
                    <button type="button" onClick={() => updateUrlParams({ search: '' })}><FiX /></button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="filter-tag">
                    التصنيف: {getCategoryName(selectedCategory)}
                    <button type="button" onClick={() => updateUrlParams({ category: 'all' })}><FiX /></button>
                  </span>
                )}
                {(minBudget || maxBudget) && (
                  <span className="filter-tag">
                    الميزانية: {minBudget ? `من ${Number(minBudget).toLocaleString()}` : ''} {maxBudget ? `إلى ${Number(maxBudget).toLocaleString()} ج.س` : ''}
                    <button type="button" onClick={() => updateUrlParams({ minBudget: '', maxBudget: '' })}><FiX /></button>
                  </span>
                )}
                {selectedDuration !== 'all' && (
                  <span className="filter-tag">
                    المدة: {selectedDuration === 'short' ? 'أقل من أسبوع' : 'أسبوع إلى شهر'}
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
                  </div>
                </div>

              </div>
            </aside>

            {/* Results Section */}
            <section className="browse-results-section">
              <div className="results-status-bar">
                <span className="results-count">
                  {loading ? 'جارٍ تحميل المشاريع...' : `تم العثور على ${sortedProjects.length} مشروع متاح`}
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
              ) : sortedProjects.length === 0 ? (
                <div className="no-results-card">
                  <FiBriefcase className="no-results-icon" />
                  <h3>لا توجد مشاريع مطابقة لخيارات البحث المحددة</h3>
                  <p>جرب تخفيف شروط البحث أو إزالة الفلاتر لعرض كافة المشاريع المفتوحة.</p>
                  <button
                    type="button"
                    className="reset-search-btn"
                    onClick={handleClearFilters}
                  >
                    عرض كافة المشاريع المتاحة
                  </button>
                </div>
              ) : (
                <div className="projects-cards-stack">
                  {sortedProjects.map((project) => {
                    const propCount = proposalsMap[project.id] || 0;
                    return (
                      <article key={project.id} className="project-feed-card">
                        <div className="project-feed-header">
                          <div className="project-title-area">
                            <span className="project-category-badge">
                              <FiTag className="badge-icon" />
                              {getCategoryName(project.categoryId)}
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
                              {project.budgetMin && project.budgetMax ? (
                                `${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()} ج.س`
                              ) : (
                                `${(project.budget || 0).toLocaleString()} ج.س`
                              )}
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
                                {project.duration ? `المدة: ${project.duration}` : 'المدة: أسبوعان'}
                              </span>
                            </div>

                            <div className="meta-info-item">
                              <FiUser className="meta-icon" />
                              <span>{propCount} عرض مقدم</span>
                            </div>

                            <div className="meta-info-item">
                              <FiCalendar className="meta-icon" />
                              <span>منذ {project.createdAt ? new Date(project.createdAt).toLocaleDateString('ar-SD') : 'مؤخراً'}</span>
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
