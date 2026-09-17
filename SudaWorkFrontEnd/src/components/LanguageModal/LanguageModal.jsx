import React from 'react';
import { FiCheck } from 'react-icons/fi';
import './LanguageModal.css';

const LanguageModal = ({ isOpen, onClose, currentLang = 'ar', onSelectLang }) => {
  if (!isOpen) return null;

  const isRtl = currentLang === 'ar';

  const handleSelect = (langCode) => {
    onSelectLang(langCode);
    onClose?.();
  };

  const languages = [
    {
      code: 'ar',
      name: 'العربية',
      flag: '🇸🇩'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🌐'
    }
  ];

  return (
    <div 
      className="fiverr-popover lang-fiverr-popover" 
      onClick={(e) => e.stopPropagation()}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top arrow pointer */}
      <div className="popover-caret" />

      <div className="lang-popover-title">
        {isRtl ? 'اختر اللغة' : 'Select Language'}
      </div>

      <div className="lang-popover-list">
        {languages.map((item) => {
          const isActive = currentLang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              className={`lang-popover-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(item.code)}
            >
              <div className="lang-item-content">
                <span className="lang-item-flag">{item.flag}</span>
                <span className="lang-item-name">{item.name}</span>
              </div>
              {isActive && (
                <span className="lang-item-check">
                  <FiCheck />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageModal;
