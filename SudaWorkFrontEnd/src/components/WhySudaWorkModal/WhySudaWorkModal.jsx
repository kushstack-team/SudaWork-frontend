import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiUsers, FiZap, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import './WhySudaWorkModal.css';

const WhySudaWorkModal = ({ isOpen, onClose, lang = 'ar' }) => {
  const navigate = useNavigate();
  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  const handleJoin = () => {
    onClose?.();
    navigate('/role-selection');
  };

  const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

  return (
    <div 
      className="fiverr-popover why-fiverr-popover" 
      onClick={(e) => e.stopPropagation()}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top arrow pointer */}
      <div className="popover-caret" />

      {/* Header */}
      <div className="why-popover-header">
        <h4 className="why-popover-title">
          {isRtl ? 'لماذا منصة سوداوورك؟' : 'Why SudaWork?'}
        </h4>
        <p className="why-popover-tagline">
          {isRtl 
            ? 'سوق العمل الحر الأول في السودان لربط الكفاءات بأصحاب الأعمال بأمان وسهولة.'
            : 'Sudan’s premier freelance marketplace connecting top talents with businesses securely.'}
        </p>
      </div>

      {/* Feature list */}
      <div className="why-popover-list">
        <div className="why-popover-item">
          <div className="why-item-icon">
            <FiShield />
          </div>
          <div className="why-item-text">
            <strong>{isRtl ? 'حماية وضمان مالي 100%' : '100% Escrow Protection'}</strong>
            <span>{isRtl ? 'حفظ المستحقات المالية حتى استلام العمل بالمواصفات المطلوبة.' : 'Funds held safely until work is delivered to your satisfaction.'}</span>
          </div>
        </div>

        <div className="why-popover-item">
          <div className="why-item-icon">
            <FiUsers />
          </div>
          <div className="why-item-text">
            <strong>{isRtl ? 'نخبة المستقلين المعتمدين' : 'Verified Sudanese Talents'}</strong>
            <span>{isRtl ? 'مطورون، مصممون ومسوقون محترفون تم التحقق من خبراتهم.' : 'Certified experts in development, design, marketing and more.'}</span>
          </div>
        </div>

        <div className="why-popover-item">
          <div className="why-item-icon">
            <FiZap />
          </div>
          <div className="why-item-text">
            <strong>{isRtl ? 'سرعة وتسهيل التعامل المحلي' : 'Fast Localized Solutions'}</strong>
            <span>{isRtl ? 'نشر المشاريع والتوظيف الفوري مع طرق دفع تلائم التعاملات السودانية.' : 'Instant hiring with flexible payment options tailored for Sudan.'}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="why-popover-footer">
        <button 
          type="button" 
          className="why-popover-btn" 
          onClick={handleJoin}
        >
          <span>{isRtl ? 'انضم إلى سوداوورك الآن' : 'Join SudaWork Now'}</span>
          <Arrow className="why-popover-btn-arrow" />
        </button>
      </div>
    </div>
  );
};

export default WhySudaWorkModal;
