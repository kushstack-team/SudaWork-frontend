import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlusCircle, FiUsers, FiShield, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import './HireTalentDropdown.css';

const HireTalentDropdown = ({ isOpen, onClose, lang = 'ar' }) => {
  if (!isOpen) return null;

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

  const items = isRtl ? [
    {
      title: 'انشر مشروعك وتلقَّ العروض',
      desc: 'سجّل دخولك كعميل لنشر مشروعك مجاناً واستقبال عروض الأسعار.',
      link: '/login?role=client',
      icon: <FiPlusCircle />
    },
    {
      title: 'تصفح دليل المستقلين المحترفين',
      desc: 'سجّل دخولك للوصول إلى بيانات المستقلين والتواصل المباشر معهم.',
      link: '/login?role=client',
      icon: <FiUsers />
    },
    {
      title: 'إدارة العقود وحماية المدفوعات',
      desc: 'ادخل إلى حساب العميل للتعاقد الآمن وحفظ مستحقاتك بنظام الضمان.',
      link: '/login?role=client',
      icon: <FiShield />
    }
  ] : [
    {
      title: 'Post a Job & Hire Pros',
      desc: 'Log in as a client to publish your project and receive competitive proposals.',
      link: '/login?role=client',
      icon: <FiPlusCircle />
    },
    {
      title: 'Browse Talent Marketplace',
      desc: 'Log in to view complete freelancer profiles and message professionals directly.',
      link: '/login?role=client',
      icon: <FiUsers />
    },
    {
      title: 'Contracts & Secure Escrow',
      desc: 'Access your client workspace for documented contracts and 100% escrow protection.',
      link: '/login?role=client',
      icon: <FiShield />
    }
  ];

  return (
    <div 
      className="fiverr-popover upwork-nav-dropdown" 
      onClick={(e) => e.stopPropagation()}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="popover-caret" />

      <div className="upwork-dropdown-header">
        <span className="upwork-dropdown-heading">
          {isRtl ? 'دخول أصحاب الأعمال (العملاء)' : 'Client Solutions & Login'}
        </span>
      </div>

      <div className="upwork-dropdown-list">
        {items.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.link} 
            className="upwork-dropdown-item"
            onClick={onClose}
          >
            <div className="upwork-item-icon">
              {item.icon}
            </div>
            <div className="upwork-item-content">
              <strong className="upwork-item-title">{item.title}</strong>
              <span className="upwork-item-desc">{item.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="upwork-dropdown-footer">
        <Link 
          to="/login?role=client" 
          className="upwork-dropdown-all-link"
          onClick={onClose}
        >
          <span>{isRtl ? 'تسجيل الدخول كعميل' : 'Log in as Client'}</span>
          <Arrow className="footer-link-arrow" />
        </Link>
      </div>
    </div>
  );
};

export default HireTalentDropdown;
