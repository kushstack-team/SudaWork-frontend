import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import './DashboardNavbar.css';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import { homeForRole } from '../../utils/roles';

// Subcomponents
import NavbarSearch from './components/NavbarSearch';
import UserDropdown from './components/UserDropdown';
import NotificationDropdown from './components/NotificationDropdown';
import NavbarCategories from './components/NavbarCategories';

const COUNTS_POLL_MS = 30000;

const DashboardNavbar = ({ onSearch, hideCategories = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [navCategories, setNavCategories] = useState([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const { isFeatureAvailable } = usePlatform();
  const isClient = user?.role === 'client';
  const shouldHideCategories = hideCategories || isClient || !isFeatureAvailable(FEATURES.PROJECT_BROWSING);
  const showMessages = user?.role !== 'admin' && isFeatureAvailable(FEATURES.MESSAGING);
  const showNotifications = isFeatureAvailable(FEATURES.NOTIFICATIONS);

  useEffect(() => {
    if (shouldHideCategories) return;
    api.taxonomy.categories().then(setNavCategories, () => setNavCategories([]));
  }, [shouldHideCategories]);

  // Unread counts and the latest notifications, refreshed periodically.
  const loadNotifications = useCallback(() => {
    if (!user?.id) return;
    if (showNotifications) {
      api.notifications.list({ limit: 8 }).then(
        (page) => {
          setNotifications(page.items);
          setUnreadNotifCount(page.unreadCount);
        },
        () => {}
      );
    }
    if (showMessages) {
      api.messages.unreadCount().then(setUnreadMsgCount, () => {});
    }
  }, [user?.id, showNotifications, showMessages]);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, COUNTS_POLL_MS);
    window.addEventListener('sudawork:notifications-changed', loadNotifications);
    return () => {
      clearInterval(timer);
      window.removeEventListener('sudawork:notifications-changed', loadNotifications);
    };
  }, [loadNotifications]);

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

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.notifications.markAllRead();
    } finally {
      loadNotifications();
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.notifications.markRead(notif.id);
      } finally {
        loadNotifications();
      }
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
      if (isClient || user?.role === 'admin') {
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
            <Link to={homeForRole(user?.role)} className="dashboard-logo" aria-label="Sudawork Home">
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


              {/* Messages Icon */}
              {showMessages && (
                <Link
                  to="/messages"
                  className="control-icon-btn"
                  title="الرسائل والمحادثات"
                  aria-label="Messages"
                >
                  <FiMail className="control-icon" />
                  {unreadMsgCount > 0 && <span className="notification-dot" />}
                </Link>
              )}

              {/* Notifications Icon & Dropdown Panel */}
              {showNotifications && (
              <NotificationDropdown
                notifications={notifications}
                unreadNotifCount={unreadNotifCount}
                isNotifDropdownOpen={isNotifDropdownOpen}
                setIsNotifDropdownOpen={setIsNotifDropdownOpen}
                onMarkAllRead={handleMarkAllNotifsRead}
                onNotifClick={handleNotifClick}
                notifMenuRef={notifMenuRef}
              />
              )}

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
