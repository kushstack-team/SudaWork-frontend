import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMail } from 'react-icons/fi';
import './DashboardNavbar.css';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';

// Subcomponents
import NavbarSearch from './components/NavbarSearch';
import UserDropdown from './components/UserDropdown';
import NotificationDropdown from './components/NotificationDropdown';
import NavbarCategories from './components/NavbarCategories';

const defaultNavCategories = [
  { id: 'web-dev', name: 'تطوير المواقع' },
  { id: 'mobile-dev', name: 'تطبيقات الجوال' },
  { id: 'ui-ux', name: 'تصميم UI/UX' },
  { id: 'graphic-design', name: 'التصميم الجرافيكي' },
  { id: 'video-editing', name: 'المونتاج والفيديو' },
  { id: 'marketing', name: 'التسويق الرقمي' },
  { id: 'writing', name: 'الكتابة والمحتوى' },
  { id: 'ai', name: 'الذكاء الاصطناعي' },
];

const DashboardNavbar = ({ onSearch, hideCategories = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [navCategories, setNavCategories] = useState(defaultNavCategories);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const isClient = user?.role === 'client';
  const shouldHideCategories = hideCategories || isClient;

  // Load dynamic categories only if not hidden
  useEffect(() => {
    if (!shouldHideCategories) {
      mockApi.categories.getAll().then((cats) => {
        if (cats && cats.length > 0) {
          setNavCategories(cats);
        }
      });
    }
  }, [shouldHideCategories]);

  // Load unread count & notifications
  const loadNotifications = async () => {
    if (user?.id) {
      const list = await mockApi.notifications.getByUser(user.id);
      setNotifications(list || []);
    }
  };

  useEffect(() => {
    if (user?.id) {
      mockApi.messages.getUnreadCount(user.id).then((count) => setUnreadMsgCount(count));
      loadNotifications();
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllNotifsRead = async () => {
    if (user?.id) {
      await mockApi.notifications.markAllAsRead(user.id);
      await loadNotifications();
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await mockApi.notifications.markAsRead(notif.id);
      await loadNotifications();
    }
    setIsNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      if (isClient) {
        navigate(`/freelancers?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    navigate(`/projects?category=${catId}`);
  };

  return (
    <header className={`dashboard-header ${shouldHideCategories ? 'no-categories-nav' : ''}`} dir="rtl">
      {/* Top Header Bar */}
      <div className="dashboard-topbar">
        <div className="dashboard-topbar-container">
          
          {/* Right Side: Logo */}
          <div className="topbar-right">
            <Link to={isClient ? '/client-dashboard' : '/'} className="dashboard-logo" aria-label="Sudawork Home">
              <img src={logo} alt="Sudawork" className="dashboard-logo-img" />
            </Link>
          </div>

          {/* Center: Search Bar */}
          <NavbarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder={isClient ? 'ابحث عن مستقلين، مهارات، كفاءات سودانية...' : 'أي خدمة أو مشروع تريد أن تبحث عنه؟'}
          />

          {/* Left Side: User Controls */}
          <div className="topbar-left">
            <div className="user-controls-group">
              
              {/* User Avatar with Dropdown */}
              <UserDropdown
                user={user}
                isProfileMenuOpen={isProfileMenuOpen}
                setIsProfileMenuOpen={setIsProfileMenuOpen}
                unreadMsgCount={unreadMsgCount}
                unreadNotifCount={unreadNotifCount}
                onLogout={handleLogout}
                menuRef={menuRef}
              />

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
              <Link 
                to="/messages" 
                className="control-icon-btn" 
                title="الرسائل والمحادثات"
                aria-label="Messages"
              >
                <FiMail className="control-icon" />
                {unreadMsgCount > 0 && <span className="notification-dot" />}
              </Link>

              {/* Notifications Icon & Dropdown Panel */}
              <NotificationDropdown
                notifications={notifications}
                unreadNotifCount={unreadNotifCount}
                isNotifDropdownOpen={isNotifDropdownOpen}
                setIsNotifDropdownOpen={setIsNotifDropdownOpen}
                onMarkAllRead={handleMarkAllNotifsRead}
                onNotifClick={handleNotifClick}
                notifMenuRef={notifMenuRef}
              />

            </div>
          </div>

        </div>
      </div>

      {/* Sub-Header: Category Navigation (Only for non-clients) */}
      {!shouldHideCategories && (
        <NavbarCategories
          categories={navCategories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
      )}
    </header>
  );
};

export default DashboardNavbar;
