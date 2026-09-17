import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Button from './Button';
import WhySudaWorkModal from './WhySudaWorkModal/WhySudaWorkModal';
import LanguageModal from './LanguageModal/LanguageModal';
import HireTalentDropdown from './HireTalentDropdown/HireTalentDropdown';
import FindWorkDropdown from './FindWorkDropdown/FindWorkDropdown';
import logo from '../assets/logo.svg';
import downarrow from '../assets/downarrow.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('sudawork_language') || 'ar';
  });

  // Track currently active dropdown ('why' | 'lang' | 'talent' | 'work' | null)
  const [activeDropdown, setActiveDropdown] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sudawork_language') || 'ar';
    document.documentElement.lang = saved;
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
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
    const handleOpenLang = () => {
      setActiveDropdown('lang');
    };

    window.addEventListener('sudawork:open-why', handleOpenWhy);
    window.addEventListener('sudawork:open-language', handleOpenLang);

    return () => {
      window.removeEventListener('sudawork:open-why', handleOpenWhy);
      window.removeEventListener('sudawork:open-language', handleOpenLang);
    };
  }, []);

  // Escape key closes open dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside closes language dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeDropdown === 'lang' && langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleMouseEnter = (name) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const handleSelectLanguage = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('sudawork_language', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    setActiveDropdown(null);
  };

  const isArabic = currentLang === 'ar';

  return (
    <nav className="navbar" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="navbar-container">
        {/* Left side (logo) */}
        <Link to="/" className="navbar-logo" aria-label="Sudawork Home">
          <img src={logo} alt="Sudawork Logo" className="logo-icon" />
        </Link>

        {/* Right side (nav links & dropdowns & action buttons) */}
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
                  <img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{ marginTop: "6px" }} />
                </span>
                {isArabic ? 'لماذا سوداوورك' : 'Why SudaWork'}
              </button>

              <WhySudaWorkModal
                isOpen={activeDropdown === 'why'}
                onClose={() => setActiveDropdown(null)}
                lang={currentLang}
              />
            </li>

            {/* 2. Language Dropdown (opens only on click) */}
            <li 
              ref={langDropdownRef}
              className="nav-item-dropdown"
            >
              <button
                type="button"
                className={`nav-link lang-link nav-btn-link ${activeDropdown === 'lang' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(prev => prev === 'lang' ? null : 'lang')}
                aria-haspopup="true"
                aria-expanded={activeDropdown === 'lang'}
              >
                <svg className="globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                {isArabic ? 'اللغة' : 'Language'}
              </button>

              <LanguageModal
                isOpen={activeDropdown === 'lang'}
                onClose={() => setActiveDropdown(null)}
                currentLang={currentLang}
                onSelectLang={handleSelectLanguage}
              />
            </li>

            {/* 3. Hire Talent (وظف موهبة) Dropdown */}
            <li 
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter('talent')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                to="/login?role=client" 
                className={`nav-link ${activeDropdown === 'talent' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(null)}
              >
                <span className={`dropdown-arrow ${activeDropdown === 'talent' ? 'rotated' : ''}`}>
                  <img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{ marginTop: "6px" }} />
                </span>
                {isArabic ? 'وظف موهبة' : 'Hire Talent'}
              </Link>

              <HireTalentDropdown
                isOpen={activeDropdown === 'talent'}
                onClose={() => setActiveDropdown(null)}
                lang={currentLang}
              />
            </li>

            {/* 4. Find Work (ابحث عن عمل) Dropdown */}
            <li 
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter('work')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                to="/login?role=freelancer" 
                className={`nav-link ${activeDropdown === 'work' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(null)}
              >
                <span className={`dropdown-arrow ${activeDropdown === 'work' ? 'rotated' : ''}`}>
                  <img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{ marginTop: "6px" }} />
                </span>
                {isArabic ? 'ابحث عن عمل' : 'Find Work'}
              </Link>

              <FindWorkDropdown
                isOpen={activeDropdown === 'work'}
                onClose={() => setActiveDropdown(null)}
                lang={currentLang}
              />
            </li>

            <hr />
            <li>
              <Link to="/login" className="nav-link nav-link-login">
                {isArabic ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            </li>
          </ul>

          <div className="navbar-actions">
            <Button
              variant="primary"
              className="btn-register-filled"
              onClick={() => navigate('/role-selection')}
            >
              {isArabic ? 'انشاء حساب' : 'Create Account'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
