import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import './MobileBottomNav.css';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import defaultAvatar from '../../assets/dashboard/avatar_ahmed.jpg';
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Load counts for authenticated user
  useEffect(() => {
    if (user?.id) {
      mockApi.messages.getUnreadCount(user.id).then((c) => setUnreadMsgCount(c || 0));
      mockApi.notifications.getUnreadCount(user.id).then((c) => setUnreadNotifCount(c || 0));
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  const homePath = user?.role === 'client' ? '/client-dashboard' : '/';

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav className="mobile-bottom-nav" dir="rtl" aria-label="شريط التنقل السفلي للهاتف">
        {isAuthenticated ? (
          <div className="mobile-nav-items">
            <NavLink
              to={homePath}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiHome className="tab-icon" />
              <span className="tab-label">الرئيسية</span>
            </NavLink>

            <NavLink
              to={user?.role === 'client' ? '/client/projects' : '/projects'}
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiBriefcase className="tab-icon" />
              <span className="tab-label">{user?.role === 'client' ? 'مشاريعي' : 'المشاريع'}</span>
            </NavLink>

            <NavLink
              to="/messages"
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

            <NavLink
              to="/notifications"
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
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiHome className="tab-icon" />
              <span className="tab-label">الرئيسية</span>
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiBriefcase className="tab-icon" />
              <span className="tab-label">المشاريع</span>
            </NavLink>

            <NavLink
              to="/freelancers"
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiUser className="tab-icon" />
              <span className="tab-label">المستقلون</span>
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <FiLogIn className="tab-icon" />
              <span className="tab-label">دخول</span>
            </NavLink>

            <NavLink
              to="/role-selection"
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
                  src={defaultAvatar}
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
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <FiShield className="drawer-nav-icon" />
                    <span>لوحة تحكم الإدارة والتحكيم</span>
                  </Link>
                )}

                <Link
                  to={user?.role === 'freelancer' ? `/freelancers/${user.id}` : `/clients/${user?.id || 'user_client_1'}`}
                  className="drawer-nav-link"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FiUser className="drawer-nav-icon" />
                  <span>الملف الشخصي العام</span>
                </Link>

                <Link
                  to={user?.role === 'freelancer' ? '/freelancer/profile/edit' : '/client/profile/edit'}
                  className="drawer-nav-link"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FiSettings className="drawer-nav-icon" />
                  <span>تعديل بيانات الحساب</span>
                </Link>

                <Link
                  to="/contracts"
                  className="drawer-nav-link"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FiFileText className="drawer-nav-icon" />
                  <span>عقود العمل والمراحل</span>
                </Link>

                {user?.role === 'client' && (
                  <>
                    <Link
                      to="/client/projects"
                      className="drawer-nav-link"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <FiBriefcase className="drawer-nav-icon" />
                      <span>مشاريعي المنشورة</span>
                    </Link>

                    <Link
                      to="/client/payments"
                      className="drawer-nav-link"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <FiDollarSign className="drawer-nav-icon" />
                      <span>الضمان والمدفوعات (بنكك)</span>
                    </Link>
                  </>
                )}

                {user?.role === 'freelancer' && (
                  <>
                    <Link
                      to="/freelancer/proposals"
                      className="drawer-nav-link"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <FiBriefcase className="drawer-nav-icon" />
                      <span>عروضي المقدمة</span>
                    </Link>

                    <Link
                      to="/freelancer/wallet"
                      className="drawer-nav-link"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <FiDollarSign className="drawer-nav-icon" />
                      <span>المحفظة وسحب الأرباح</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/disputes"
                  className="drawer-nav-link"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FiAlertTriangle className="drawer-nav-icon" />
                  <span>مركز النزاعات والتحكيم</span>
                </Link>

                <Link
                  to="/notifications"
                  className="drawer-nav-link"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FiBell className="drawer-nav-icon" />
                  <span>الإشعارات والتنبيهات</span>
                  {unreadNotifCount > 0 && (
                    <span className="drawer-badge">{unreadNotifCount}</span>
                  )}
                </Link>
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
