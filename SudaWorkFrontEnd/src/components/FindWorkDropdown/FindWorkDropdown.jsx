import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiUserCheck, FiCreditCard, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import '../HireTalentDropdown/HireTalentDropdown.css';

const FindWorkDropdown = ({ isOpen, onClose, lang = 'ar' }) => {
  if (!isOpen) return null;

  const isRtl = lang === 'ar';
  const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

  const items = isRtl ? [
    {
      title: 'تصفح وتقديم العروض على المشاريع',
      desc: 'سجّل دخولك كمستقل للتقديم على مئات المشاريع والتواصل مع أصحاب الأعمال.',
      link: '/login?role=freelancer',
      icon: <FiSearch />
    },
    {
      title: 'إدارة وتطوير ملفك المهني',
      desc: 'ادخل إلى حسابك لتحديث معرض أعمالك ومهاراتك لتصدر نتائج البحث.',
      link: '/login?role=freelancer',
      icon: <FiUserCheck />
    },
    {
      title: 'متابعة المحفظة وسحب الأرباح',
      desc: 'سجّل دخولك لمتابعة رصيدك المالي وسحب أرباحك بأمان عبر بنكك.',
      link: '/login?role=freelancer',
      icon: <FiCreditCard />
    }
  ] : [
    {
      title: 'Browse & Submit Proposals',
      desc: 'Log in as a freelancer to submit proposals and connect with project clients.',
      link: '/login?role=freelancer',
      icon: <FiSearch />
    },
    {
      title: 'Manage Your Portfolio',
      desc: 'Access your profile to showcase recent work samples and verified skills.',
      link: '/login?role=freelancer',
      icon: <FiUserCheck />
    },
    {
      title: 'Wallet & Guaranteed Payouts',
      desc: 'Log in to track your earnings balance and withdraw securely via Bank of Khartoum.',
      link: '/login?role=freelancer',
      icon: <FiCreditCard />
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
          {isRtl ? 'دخول المستقلين والمحترفين' : 'Freelancer Portal & Login'}
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
          to="/login?role=freelancer" 
          className="upwork-dropdown-all-link"
          onClick={onClose}
        >
          <span>{isRtl ? 'تسجيل الدخول كمستقل' : 'Log in as Freelancer'}</span>
          <Arrow className="footer-link-arrow" />
        </Link>
      </div>
    </div>
  );
};

export default FindWorkDropdown;
