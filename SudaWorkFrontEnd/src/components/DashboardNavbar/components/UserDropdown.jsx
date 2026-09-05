import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiBriefcase,
  FiFileText,
  FiShield,
  FiDollarSign,
  FiAlertTriangle,
  FiBell,
  FiMail
} from 'react-icons/fi';
import userAvatar from '../../../assets/dashboard/avatar_ahmed.jpg';

export default function UserDropdown({
  user,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  unreadMsgCount,
  unreadNotifCount,
  onLogout,
  menuRef
}) {
  return (
    <div className="user-menu-container" ref={menuRef}>
      <div 
        className="user-avatar-wrapper" 
        title={user ? `${user.fullName} - متصل` : 'الملف الشخصي'}
        onClick={() => setIsProfileMenuOpen((prev) => !prev)}
      >
        <img 
          src={userAvatar} 
          alt={user?.fullName || 'المستخدم'} 
          className="user-avatar-img" 
        />
        <span className="online-badge" />
      </div>

      {isProfileMenuOpen && (
        <div className="user-profile-dropdown" role="menu">
          <div className="dropdown-user-header">
            <p className="dropdown-user-name">{user?.fullName || 'أحمد الفاتح'}</p>
            <p className="dropdown-user-role">
              {user?.role === 'client' ? 'حساب صاحب عمل' : user?.role === 'admin' ? 'مدير النظام' : 'حساب مستقل'}
            </p>
          </div>
          <hr className="dropdown-divider" />
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="dropdown-menu-item"
              style={{ backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 700 }}
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiShield className="dropdown-icon" style={{ color: '#16a34a' }} />
              <span>لوحة الإدارة والتحكيم (Admin)</span>
            </Link>
          )}
          <Link
            to={user?.role === 'freelancer' ? `/freelancers/${user.id}` : `/clients/${user?.id || 'user_client_1'}`}
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiUser className="dropdown-icon" />
            <span>الملف الشخصي العام</span>
          </Link>
          <Link
            to={user?.role === 'freelancer' ? '/freelancer/profile/edit' : '/client/profile/edit'}
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiSettings className="dropdown-icon" />
            <span>تعديل بيانات الحساب</span>
          </Link>
          {user?.role === 'client' && (
            <Link
              to="/client/projects"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiBriefcase className="dropdown-icon" />
              <span>مشاريعي</span>
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link
              to="/freelancer/proposals"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiFileText className="dropdown-icon" />
              <span>عروضي المقدمة</span>
            </Link>
          )}
          <Link
            to="/contracts"
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiShield className="dropdown-icon" />
            <span>عقود العمل</span>
          </Link>
          {user?.role === 'client' && (
            <Link
              to="/client/payments"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiDollarSign className="dropdown-icon" />
              <span>الضمان والمدفوعات</span>
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link
              to="/freelancer/wallet"
              className="dropdown-menu-item"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FiDollarSign className="dropdown-icon" />
              <span>المحفظة والأرباح</span>
            </Link>
          )}
          <Link
            to="/messages"
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiMail className="dropdown-icon" />
            <span>المحادثات والرسائل</span>
            {unreadMsgCount > 0 && (
              <span className="unread-dropdown-badge">{unreadMsgCount}</span>
            )}
          </Link>
          <Link
            to="/disputes"
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiAlertTriangle className="dropdown-icon" />
            <span>النزاعات والبلاغات</span>
          </Link>
          <Link
            to="/notifications"
            className="dropdown-menu-item"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <FiBell className="dropdown-icon" />
            <span>الإشعارات والتنبيهات</span>
            {unreadNotifCount > 0 && (
              <span className="unread-dropdown-badge">{unreadNotifCount}</span>
            )}
          </Link>
          <hr className="dropdown-divider" />
          <button
            type="button"
            className="dropdown-menu-item dropdown-logout-btn"
            onClick={onLogout}
          >
            <FiLogOut className="dropdown-icon" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
