import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Button from './Button';
import logo from '../assets/logo.svg';
import downarrow from '../assets/downarrow.png';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side (logo) */}
        <Link to="/" className="navbar-logo" aria-label="Sudawork Home">
          <img src={logo} alt="Sudawork Logo" className="logo-icon" />
        </Link>

        {/* Right side (nav links & dropdowns & action buttons) */}
        <div className="navbar-nav-group">
          <ul className="navbar-links">
            <li className="nav-item-dropdown">
              <a href="#why-sudawork" className="nav-link">
                <span className="dropdown-arrow">
                  <img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{ marginTop: "6px" }} />
                </span>
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
              <Link to="/freelancers" className="nav-link">
                <span className="dropdown-arrow">
                  <img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{ marginTop: "6px" }} />
                </span>
                وظف موهبة 
              </Link>
            </li>
            <li className="nav-item-dropdown">
              <Link to="/projects" className="nav-link">
                <span className="dropdown-arrow">
                  <img src={downarrow} alt="downarrow" className="dropdown-arrow-icon" width={10} style={{ marginTop: "6px" }} />
                </span>
                ابحث عن عمل 
              </Link>
            </li>
            <hr />
            <li>
              <Link to="/login" className="nav-link nav-link-login">تسجيل الدخول</Link>
            </li>
          </ul>

          <div className="navbar-actions">
            <Button
              variant="primary"
              className="btn-register-filled"
              onClick={() => navigate('/role-selection')}
            >
              انشاء حساب
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
