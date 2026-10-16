import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import './MobileBottomNav.css';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import { homeForRole } from '../../utils/roles';
import defaultAvatar from '../../assets/default-avatar.svg';
import {
  FiHome,
  FiBriefcase,
  FiMail,
  FiBell,
  FiUser,
  FiX,
  FiLogOut,
  FiShield,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiAlertTriangle,
  FiLogIn,
  FiUserPlus
} from 'react-icons/fi';

const MobileBottomNav = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { isFeatureAvailable } = usePlatform();
  const isAdmin = user?.role === 'admin';
  const showMessages = !isAdmin && isFeatureAvailable(FEATURES.MESSAGING);
  const showNotifications = isFeatureAvailable(FEATURES.NOTIFICATIONS);

  const [drawerPath, setDrawerPath] = useState(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  // The drawer closes on navigation because it is tied to the path it opened on.
  const isDrawerOpen = drawerPath === location.pathname;
  const setIsDrawerOpen = (open) => {
    const next = typeof open === 'function' ? open(isDrawerOpen) : open;
    setDrawerPath(next ? location.pathname : null);
  };

  // Refresh unread counts on navigation (badges only; failures keep the last value).
  useEffect(() => {
    if (!user?.id) return;
    if (showMessages) api.messages.unreadCount().then(setUnreadMsgCount, () => {});
    if (showNotifications) api.notifications.unreadCount().then(setUnreadNotifCount, () => {});
  }, [user?.id, location.pathname, showMessages, showNotifications]);

  const handleNavClick = () => {
    setIsDrawerOpen(false);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  const handleLogout = async () => {
    handleNavClick();
    await logout();
    navigate('/login');
  };

  const homePath = homeForRole(user?.role);
  const browseTab = user?.role === 'client'
    ? { to: '/client/projects', label: 'مشاريعي' }
    : isAdmin
      ? { to: '/admin', label: 'الإدارة' }
      : isFeatureAvailable(FEATURES.PROJECT_BROWSING)
        ? { to: '/projects', label: 'المشاريع' }
        : { to: '/freelancer/proposals', label: 'عروضي' };

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav className="mobile-bottom-nav" dir="rtl" aria-label="شريط التنقل السفلي للهاتف">
        {isAuthenticated ? (
          <div className="mobile-nav-items">
            <NavLink
              to={homePath}
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiHome className="tab-icon" />
              <span className="tab-label">الرئيسية</span>
            </NavLink>

            <NavLink
              to={browseTab.to}
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiBriefcase className="tab-icon" />
              <span className="tab-label">{browseTab.label}</span>
            </NavLink>

            {showMessages && (
            <NavLink
              to="/messages"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="tab-icon-wrap">
                <FiMail className="tab-icon" />
                {unreadMsgCount > 0 && (
                  <span className="mobile-badge">{unreadMsgCount}</span>
                )}
              </div>
              <span className="tab-label">الرسائل</span>
            </NavLink>
            )}

            {showNotifications && (
            <NavLink
              to="/notifications"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="tab-icon-wrap">
                <FiBell className="tab-icon" />
                {unreadNotifCount > 0 && (
                  <span className="mobile-badge">{unreadNotifCount}</span>
                )}
              </div>
              <span className="tab-label">التنبيهات</span>
            </NavLink>
            )}

            <button
              type="button"
              className={`mobile-nav-tab ${isDrawerOpen ? 'active' : ''}`}
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              aria-label="القائمة والمزيد"
            >
              <FiUser className="tab-icon" />
              <span className="tab-label">حسابي</span>
            </button>
          </div>
        ) : (
          <div className="mobile-nav-items">
            <NavLink
              to="/"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiHome className="tab-icon" />
              <span className="tab-label">الرئيسية</span>
            </NavLink>

            {isFeatureAvailable(FEATURES.PROJECT_BROWSING) && (
            <NavLink
              to="/projects"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiBriefcase className="tab-icon" />
              <span className="tab-label">المشاريع</span>
            </NavLink>
            )}

            {isFeatureAvailable(FEATURES.FREELANCER_DIRECTORY) && (
            <NavLink
              to="/freelancers"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiUser className="tab-icon" />
              <span className="tab-label">المستقلون</span>
            </NavLink>
            )}

            <NavLink
              to="/login"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiLogIn className="tab-icon" />
              <span className="tab-label">دخول</span>
            </NavLink>

            <NavLink
              to="/role-selection"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-nav-tab highlight ${isActive ? 'active' : ''}`}
            >
              <FiUserPlus className="tab-icon" />
              <span className="tab-label">انضمام</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Slide-over Mobile Drawer for User Menu */}
      {isDrawerOpen && isAuthenticated && (
        <div className="mobile-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
            
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-user-info">
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.fullName || 'المستخدم'}
                  className="drawer-avatar"
                />
                <div>
                  <h3 className="drawer-user-name">{user?.fullName}</h3>
                  <span className="drawer-user-role">
                    {user?.role === 'client' && 'حساب صاحب عمل'}
                    {user?.role === 'freelancer' && 'حساب مستقل محترف'}
                    {user?.role === 'admin' && 'مدير النظام (Super Admin)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="إغلاق القائمة"
              >
                <FiX />
              </button>
            </div>

            {/* Drawer Links List */}
            <div className="drawer-links-scroll">
              <div className="drawer-nav-group">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="drawer-nav-link admin-highlight"
                    onClick={handleNavClick}
                  >
                    <FiShield className="drawer-nav-icon" />
                    <span>لوحة تحكم الإدارة والتحكيم</span>
                  </Link>
                )}

                {!isAdmin && (
                  <>
                    <Link
                      to={user?.role === 'freelancer' ? `/freelancers/${user.id}` : `/clients/${user?.id}`}
                      className="drawer-nav-link"
                      onClick={handleNavClick}
                    >
                      <FiUser className="drawer-nav-icon" />
                      <span>الملف الشخصي العام</span>
                    </Link>

                    <Link
                      to={user?.role === 'freelancer' ? '/freelancer/profile/edit' : '/client/profile/edit'}
                      className="drawer-nav-link"
                      onClick={handleNavClick}
                    >
                      <FiSettings className="drawer-nav-icon" />
                      <span>تعديل بيانات الحساب</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/contracts"
                  className="drawer-nav-link"
                  onClick={handleNavClick}
                >
                  <FiFileText className="drawer-nav-icon" />
                  <span>عقود العمل والمراحل</span>
                </Link>

                {user?.role === 'client' && (
                  <>
                    <Link
                      to="/client/projects"
                      className="drawer-nav-link"
                      onClick={handleNavClick}
                    >
                      <FiBriefcase className="drawer-nav-icon" />
                      <span>مشاريعي المنشورة</span>
                    </Link>

                    {isFeatureAvailable(FEATURES.PAYMENT_REQUESTS) && (
                      <Link
                        to="/client/payments"
                        className="drawer-nav-link"
                        onClick={handleNavClick}
                      >
                        <FiDollarSign className="drawer-nav-icon" />
                        <span>الضمان والمدفوعات</span>
                      </Link>
                    )}
                  </>
                )}

                {user?.role === 'freelancer' && (
                  <>
                    <Link
                      to="/freelancer/proposals"
                      className="drawer-nav-link"
                      onClick={handleNavClick}
                    >
                      <FiBriefcase className="drawer-nav-icon" />
                      <span>عروضي المقدمة</span>
                    </Link>

                    <Link
                      to="/freelancer/wallet"
                      className="drawer-nav-link"
                      onClick={handleNavClick}
                    >
                      <FiDollarSign className="drawer-nav-icon" />
                      <span>المحفظة وسحب الأرباح</span>
                    </Link>
                  </>
                )}

                {!isAdmin && isFeatureAvailable(FEATURES.DISPUTES) && (
                  <Link
                    to="/disputes"
                    className="drawer-nav-link"
                    onClick={handleNavClick}
                  >
                    <FiAlertTriangle className="drawer-nav-icon" />
                    <span>مركز النزاعات والتحكيم</span>
                  </Link>
                )}

                {showNotifications && (
                  <Link
                    to="/notifications"
                    className="drawer-nav-link"
                    onClick={handleNavClick}
                  >
                    <FiBell className="drawer-nav-icon" />
                    <span>الإشعارات والتنبيهات</span>
                    {unreadNotifCount > 0 && (
                      <span className="drawer-badge">{unreadNotifCount}</span>
                    )}
                  </Link>
                )}
              </div>

              <div className="drawer-divider" />

              <button
                type="button"
                className="drawer-nav-link logout-btn"
                onClick={handleLogout}
              >
                <FiLogOut className="drawer-nav-icon" />
                <span>تسجيل الخروج</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
