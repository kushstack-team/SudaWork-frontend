import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
  FiAlertTriangle,
  FiStar
} from 'react-icons/fi';
import { formatTimeAgo } from '../../../utils/formatters';

export default function NotificationDropdown({
  notifications,
  unreadNotifCount,
  isNotifDropdownOpen,
  setIsNotifDropdownOpen,
  onMarkAllRead,
  onNotifClick,
  notifMenuRef
}) {
  const getNotifIcon = (type) => {
    switch (type) {
      case 'proposal_received':
      case 'proposal_viewed':
      case 'proposal_accepted':
        return <FiFileText className="notif-item-icon proposal" />;
      case 'work_submitted':
      case 'deliverable_approved':
        return <FiCheckCircle className="notif-item-icon delivery" />;
      case 'escrow_funded':
      case 'escrow_released':
      case 'withdrawal_requested':
      case 'withdrawal_completed':
        return <FiDollarSign className="notif-item-icon payment" />;
      case 'dispute_opened':
        return <FiAlertTriangle className="notif-item-icon dispute" />;
      case 'review_received':
        return <FiStar className="notif-item-icon review" />;
      default:
        return <FiBell className="notif-item-icon default" />;
    }
  };

  return (
    <div className="notif-menu-container" ref={notifMenuRef}>
      <button 
        type="button" 
        className={`control-icon-btn ${isNotifDropdownOpen ? 'active' : ''}`}
        title="التنبيهات والإشعارات"
        aria-label="Notifications"
        onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
      >
        <FiBell className="control-icon" />
        {unreadNotifCount > 0 && (
          <span className="notification-badge">{unreadNotifCount}</span>
        )}
      </button>

      {isNotifDropdownOpen && (
        <div className="notifications-dropdown" role="region" aria-label="الإشعارات">
          <div className="notif-dropdown-header">
            <div className="notif-header-title-wrap">
              <span className="notif-header-title">الإشعارات والتنبيهات</span>
              {unreadNotifCount > 0 && (
                <span className="notif-unread-tag">{unreadNotifCount} جديدة</span>
              )}
            </div>
            {unreadNotifCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-read-btn"
                onClick={onMarkAllRead}
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <FiBell className="notif-empty-icon" />
                <p>لا توجد إشعارات جديدة لديك حالياً</p>
              </div>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={`notif-dropdown-item ${!item.isRead ? 'unread' : ''}`}
                  onClick={() => onNotifClick(item)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-icon-box">
                    {getNotifIcon(item.type)}
                  </div>
                  <div className="notif-item-details">
                    <p className="notif-item-msg">{item.message}</p>
                    <span className="notif-item-time">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                  {!item.isRead && <span className="notif-item-dot" />}
                </div>
              ))
            )}
          </div>

          <div className="notif-dropdown-footer">
            <Link
              to="/notifications"
              className="notif-footer-link"
              onClick={() => setIsNotifDropdownOpen(false)}
            >
              عرض جميع الإشعارات والسجل الكامل &larr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
