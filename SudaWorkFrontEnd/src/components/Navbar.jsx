import React from 'react';
import './Navbar.css';
import Button from './Button';
import logo from '../assets/logo.svg';
import downarrow from '../assets/downarrow.png';
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side (logo with a small icon) */}
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo-icon" />
        </div>

        {/* Right side (nav links & dropdowns & action buttons) */}
        <div className="navbar-nav-group">
          <ul className="navbar-links">
            <li className="nav-item-dropdown">
              <a href="#why-sudawork" className="nav-link">
                <span className="dropdown-arrow"><img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{marginTop:"6px"}}/></span>
                لماذا سوداوورك 
              </a>
            </li>
            <li className="nav-item-dropdown">
              <a href="#language" className="nav-link lang-link">
                <svg className="globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                اللغة 
              </a>
            </li>
            <li className="nav-item-dropdown">
              <a href="#hire-talent" className="nav-link">
                <span className="dropdown-arrow"><img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{marginTop:"6px"}}/></span>
                وظف موهبة 
              </a>
            </li>
            <li className="nav-item-dropdown">
              <a href="#find-work" className="nav-link">
                <span className="dropdown-arrow"><img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{marginTop:"6px"}}/></span>
                ابحث عن عمل 
              </a>
            </li>
            <hr />
            <li>
              <a href="#login" className="nav-link nav-link-login">تسجيل الدخول</a>
            </li>
          </ul>

          <div className="navbar-actions">
            <Button variant="primary" className="btn-register-filled">انشاء حساب</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
