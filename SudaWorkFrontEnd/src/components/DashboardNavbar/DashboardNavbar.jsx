import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiHeart, 
  FiMail, 
  FiBell 
} from 'react-icons/fi';
import './DashboardNavbar.css';
import logo from '../../assets/logo.svg';
import userAvatar from '../../assets/dashboard/avatar_ahmed.jpg';

const categories = [
  { id: 'prog', name: 'البرمجة & التكنولوجيا' },
  { id: 'mktg', name: 'التسويق الرقمي' },
  { id: 'design', name: 'التصميم الجرافيكي' },
  { id: 'ai', name: 'خدمات الذكاء الاصطناعي' },
  { id: 'video', name: 'الفيديو & الرسوم المتحركة' },
];

const DashboardNavbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('prog');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="dashboard-header" dir="rtl">
      {/* Top Header Bar */}
      <div className="dashboard-topbar">
        <div className="dashboard-topbar-container">
          
          {/* Right Side: Logo */}
          <div className="topbar-right">
            <Link to="/" className="dashboard-logo" aria-label="Sudawork Home">
              <img src={logo} alt="Sudawork" className="dashboard-logo-img" />
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="topbar-center">
            <form className="dashboard-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="dashboard-search-input"
                placeholder="أي خدمة تريد أن تبحث عنها؟"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
              <button type="submit" className="dashboard-search-btn" aria-label="Search button">
                <FiSearch className="search-icon" />
              </button>
            </form>
          </div>

          {/* Left Side: User Controls */}
          <div className="topbar-left">
            <div className="user-controls-group">
              
              {/* User Avatar with Online Dot */}
              <div className="user-avatar-wrapper" title="أحمد - متصل">
                <img 
                  src={userAvatar} 
                  alt="أحمد" 
                  className="user-avatar-img" 
                />
                <span className="online-badge" />
              </div>

              {/* Heart / Favorites Icon */}
              <button 
                type="button" 
                className="control-icon-btn" 
                title="المفضلة"
                aria-label="Favorites"
              >
                <FiHeart className="control-icon" />
              </button>

              {/* Messages Icon */}
              <button 
                type="button" 
                className="control-icon-btn" 
                title="الرسائل"
                aria-label="Messages"
              >
                <FiMail className="control-icon" />
                <span className="notification-dot" />
              </button>

              {/* Notifications Icon */}
              <button 
                type="button" 
                className="control-icon-btn" 
                title="التنبيهات"
                aria-label="Notifications"
              >
                <FiBell className="control-icon" />
                <span className="notification-badge">2</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Sub-Header: Category Navigation */}
      <nav className="dashboard-category-nav" aria-label="Categories Navigation">
        <div className="dashboard-category-container">
          <ul className="category-menu-list">
            {categories.map((cat) => (
              <li key={cat.id} className="category-menu-item">
                <button
                  type="button"
                  className={`category-menu-link ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default DashboardNavbar;
