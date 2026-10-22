import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import Button from './Button';
import WhySudaWorkModal from './WhySudaWorkModal/WhySudaWorkModal';
import HireTalentDropdown from './HireTalentDropdown/HireTalentDropdown';
import FindWorkDropdown from './FindWorkDropdown/FindWorkDropdown';
import Logo from './Logo/Logo';
import { useAuth } from '../context/auth';
import { homeForRole } from '../utils/roles';
import { FiChevronDown, FiArrowLeft, FiX } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // The public header is shared by signed-in users (e.g. returning to "/"),
  // so it must reflect the session instead of always offering login/sign-up.
  const { isAuthenticated, loading: authLoading, role } = useAuth();
  const dashboardPath = homeForRole(role);
  const hireTalentPath = isAuthenticated ? dashboardPath : '/login?role=client';
  const findWorkPath = isAuthenticated ? dashboardPath : '/login?role=freelancer';

  // Desktop active dropdown ('why' | 'talent' | 'work' | null)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const toggleBtnRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Reset menus on route change during render
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileExpandedSection(null);
  }

  // Set Arabic RTL by default
  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }, []);

  // Clear hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Listen to custom open events (e.g. from footer)
  useEffect(() => {
    const handleOpenWhy = () => {
      setActiveDropdown('why');
    };

    window.addEventListener('sudawork:open-why', handleOpenWhy);

    return () => {
      window.removeEventListener('sudawork:open-why', handleOpenWhy);
    };
  }, []);

  // Escape key closes open dropdown or mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  // Trap focus inside mobile drawer while open
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const drawerEl = mobileDrawerRef.current;
    if (!drawerEl) return;

    const focusable = drawerEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    drawerEl.addEventListener('keydown', handleTabKey);
    return () => drawerEl.removeEventListener('keydown', handleTabKey);
  }, [isMobileMenuOpen]);

  const handleMouseEnter = (name) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedSection(null);
  }, []);

  const toggleMobileSection = (section) => {
    setMobileExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <nav className="navbar" dir="rtl">
      <div className="navbar-container">
        {/* Brand Wordmark Logo */}
        <Logo to="/" ariaLabel="Sudawork Home" />

        {/* Desktop Navigation */}
        <div className="navbar-nav-group">
          <ul className="navbar-links">
            {/* 1. Why SudaWork Dropdown */}
            <li
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter('why')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`nav-link nav-btn-link ${activeDropdown === 'why' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(prev => prev === 'why' ? null : 'why')}
                aria-haspopup="true"
                aria-expanded={activeDropdown === 'why'}
              >
                <span className={`dropdown-arrow ${activeDropdown === 'why' ? 'rotated' : ''}`}>
                  <FiChevronDown className="dropdown-arrow-icon" style={{ marginTop: '4px' }} />
                </span>
                لماذا سوداوورك
              </button>

              <WhySudaWorkModal
                isOpen={activeDropdown === 'why'}
                onClose={() => setActiveDropdown(null)}
                lang="ar"
              />
            </li>

            {/* 2. Hire Talent (وظف موهبة) Dropdown */}
            <li
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter('talent')}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={hireTalentPath}
                className={`nav-link ${activeDropdown === 'talent' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(null)}
              >
                <span className={`dropdown-arrow ${activeDropdown === 'talent' ? 'rotated' : ''}`}>
                  <FiChevronDown className="dropdown-arrow-icon" style={{ marginTop: '4px' }} />
                </span>
                وظف موهبة
              </Link>

              <HireTalentDropdown
                isOpen={activeDropdown === 'talent'}
                onClose={() => setActiveDropdown(null)}
                lang="ar"
              />
            </li>

            {/* 3. Search jobs (ابحث عن عمل) Dropdown */}
            <li
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter('work')}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={findWorkPath}
                className={`nav-link ${activeDropdown === 'work' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(null)}
              >
                <span className={`dropdown-arrow ${activeDropdown === 'work' ? 'rotated' : ''}`}>
                  <FiChevronDown className="dropdown-arrow-icon" style={{ marginTop: '4px' }} />
                </span>
                ابحث عن عمل
              </Link>

              <FindWorkDropdown
                isOpen={activeDropdown === 'work'}
                onClose={() => setActiveDropdown(null)}
                lang="ar"
              />
            </li>

            <li className="navbar-divider-item" aria-hidden="true">
              <span className="navbar-divider" />
            </li>

            {!authLoading && !isAuthenticated && (
              <li>
                <Link to="/login" className="nav-link nav-link-login">
                  تسجيل الدخول
                </Link>
              </li>
            )}
          </ul>

          {/* Nothing is shown until the stored session is resolved, so a
              signed-in user never sees login/sign-up flash on refresh. */}
          {!authLoading && (
            <div className="navbar-actions">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  className="btn-register-filled"
                  onClick={() => navigate(dashboardPath)}
                >
                  لوحة التحكم
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="btn-register-filled"
                  onClick={() => navigate('/role-selection')}
                >
                  انشاء حساب
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile View Toggle Button with nav-toggle-box and nav-toggle-inner */}
        <button
          ref={toggleBtnRef}
          type="button"
          className="nav-toggle-btn"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          <div className={`nav-toggle-box ${isMobileMenuOpen ? 'active' : ''}`}>
            <div className={`nav-toggle-inner ${isMobileMenuOpen ? 'active' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer containing the navlinks */}
      {isMobileMenuOpen && (
        <aside
          id="mobile-nav-drawer"
          ref={mobileDrawerRef}
          className="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
        >
          {/* Drawer Header: Wordmark + Close Button */}
          <div className="mobile-drawer-header">
            <Logo to="/" onClick={closeMobileMenu} ariaLabel="Sudawork Home" />
            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={closeMobileMenu}
              aria-label="إغلاق القائمة"
            >
              <FiX size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Drawer Content with all the navlinks */}
          <div className="mobile-drawer-content">
            <div className="mobile-nav-links-section">
              {/* 1. Why SudaWork Accordion */}
              <div className={`mobile-accordion-item ${mobileExpandedSection === 'why' ? 'open' : ''}`}>
                <button
                  type="button"
                  className="mobile-accordion-header"
                  onClick={() => toggleMobileSection('why')}
                  aria-expanded={mobileExpandedSection === 'why'}
                >
                  <span>لماذا سوداوورك</span>
                  <FiChevronDown
                    size={16}
                    className={`mobile-accordion-chevron ${mobileExpandedSection === 'why' ? 'rotated' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {mobileExpandedSection === 'why' && (
                  <div className="mobile-accordion-body">
                    <div className="mobile-feature-item">
                      <strong>حماية وضمان مالي 100%</strong>
                      <p>حفظ المستحقات المالية حتى استلام العمل بالمواصفات المطلوبة.</p>
                    </div>
                    <div className="mobile-feature-item">
                      <strong>نخبة المستقلين المعتمدين</strong>
                      <p>مطورون، مصممون ومسوقون تم التحقق من خبراتهم بدقة.</p>
                    </div>
                    <Link
                      to="/role-selection"
                      className="mobile-accordion-action-link"
                      onClick={closeMobileMenu}
                    >
                      <span>ابدأ العمل الآن</span>
                      <FiArrowLeft size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {/* 2. Hire Talent Accordion */}
              <div className={`mobile-accordion-item ${mobileExpandedSection === 'talent' ? 'open' : ''}`}>
                <button
                  type="button"
                  className="mobile-accordion-header"
                  onClick={() => toggleMobileSection('talent')}
                  aria-expanded={mobileExpandedSection === 'talent'}
                >
                  <span>وظف موهبة</span>
                  <FiChevronDown
                    size={16}
                    className={`mobile-accordion-chevron ${mobileExpandedSection === 'talent' ? 'rotated' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {mobileExpandedSection === 'talent' && (
                  <div className="mobile-accordion-body">
                    <Link
                      to={hireTalentPath}
                      className="mobile-sub-link"
                      onClick={closeMobileMenu}
                    >
                      <span className="mobile-sub-title">انشر مشروعك وتلقَّ العروض</span>
                      <span className="mobile-sub-desc">سجّل دخولك لنشر مشروعك واستقبال العروض التنافسية.</span>
                    </Link>
                    <Link
                      to={hireTalentPath}
                      className="mobile-sub-link"
                      onClick={closeMobileMenu}
                    >
                      <span className="mobile-sub-title">تصفح دليل المستقلين</span>
                      <span className="mobile-sub-desc">الوصول إلى بيانات المستقلين والتواصل المباشر معهم.</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Search jobs (ابحث عن عمل) Button */}
            <div className="mobile-search-jobs-section">
              <Link
                to={findWorkPath}
                className="mobile-search-jobs-btn"
                onClick={closeMobileMenu}
              >
                <span>ابحث عن عمل</span>
                <FiArrowLeft size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* 4. Login & Sign-up Navigation Links */}
            {!authLoading && (
              <div className="mobile-auth-actions">
                {isAuthenticated ? (
                  <Button
                    variant="primary"
                    className="btn-register-filled mobile-register-btn"
                    onClick={() => {
                      closeMobileMenu();
                      navigate(dashboardPath);
                    }}
                  >
                    لوحة التحكم
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="mobile-login-link"
                      onClick={closeMobileMenu}
                    >
                      تسجيل الدخول
                    </Link>
                    <Button
                      variant="primary"
                      className="btn-register-filled mobile-register-btn"
                      onClick={() => {
                        closeMobileMenu();
                        navigate('/role-selection');
                      }}
                    >
                      انشاء حساب
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </nav>
  );
};

export default Navbar;
