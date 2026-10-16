import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import Logo from '../assets/logo.svg';
import { FaX, FaInstagram, FaLinkedin, FaFacebook, FaTiktok } from 'react-icons/fa6';
import { FiChevronDown, FiGlobe, FiShield } from 'react-icons/fi';

const FOOTER_SECTIONS = [
  {
    id: 'clients',
    title: 'لأصحاب الأعمال',
    links: [
      { label: 'كيف توظف على سوداوورك', href: '/how-it-works' },
      { label: 'تصفح المستقلين والمحترفين', href: '/freelancers' },
      { label: 'نشر مشروع جديد', href: '/post-project' },
      { label: 'إدارة المشاريع والعقود', href: '/client/projects' },
      { label: 'نظام الدفع الآمن والضمان', href: '/how-it-works' },
    ],
  },
  {
    id: 'freelancers',
    title: 'للمستقلين والمحترفين',
    links: [
      { label: 'كيف تعمل وتكسب أرباحك', href: '/how-it-works' },
      { label: 'تصفح المشاريع المفتوحة', href: '/projects' },
      { label: 'عروضي المقدمة', href: '/freelancer/proposals' },
      { label: 'محفظة الأرباح وسحب الأموال', href: '/freelancer/wallet' },
      { label: 'التسجيل كمستقل الآن', href: '/role-selection' },
    ],
  },
  {
    id: 'categories',
    title: 'التصنيفات والخدمات',
    links: [
      { label: 'البرمجة وتكنولوجيا المعلومات', href: '/projects?search=برمجة' },
      { label: 'التصميم والإبداع الفني', href: '/projects?search=تصميم' },
      { label: 'التسويق الرقمي والمبيعات', href: '/projects?search=تسويق' },
      { label: 'الكتابة والترجمة وصناعة المحتوى', href: '/projects?search=كتابة' },
      { label: 'جميع تصنيفات الأعمال', href: '/categories' },
    ],
  },
  {
    id: 'company',
    title: 'سوداوورك والمساعدة',
    links: [
      { label: 'عن سوداوورك (SudaWork)', href: '#about', isWhyModal: true },
      { label: 'مركز المساعدة والدعم الفني', href: '/help' },
      { label: 'كيف يضمن الموقع حقوقك', href: '/how-it-works' },
      { label: 'فرص التوظيف والمهن', href: '/careers' },
      { label: 'الشروط والأحكام القانونية', href: '/terms' },
      { label: 'سياسة الخصوصية والأمان', href: '/privacy' },
    ],
  },
];

const Footer = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="footer" dir="rtl">
      <div className="footer-container">
        {/* Upwork-grade 4-Column Grid on Desktop / Accordion on Mobile */}
        <div className="footer-columns">
          {FOOTER_SECTIONS.map((section) => {
            const isOpen = Boolean(openSections[section.id]);
            return (
              <div 
                key={section.id} 
                className={`footer-col ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="footer-accordion-header"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                >
                  <h3 className="footer-col-title">{section.title}</h3>
                  <FiChevronDown className="footer-accordion-chevron" aria-hidden="true" />
                </button>

                <ul className="footer-links-list">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') ? (
                        <Link to={link.href} onClick={handleScrollTop}>{link.label}</Link>
                      ) : (
                        <a
                          href={link.href}
                          onClick={(e) => {
                            if (link.isWhyModal) {
                              e.preventDefault();
                              window.dispatchEvent(new CustomEvent('sudawork:open-why'));
                            }
                          }}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upwork-style Secondary Strip: Brand, Trust, Selectors, and Socials */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-mid-bar">
            {/* Brand Logo & Socials Section */}
            <div className="footer-brand-social-group">
              <Link to="/" onClick={handleScrollTop} className="footer-brand-link" aria-label="Sudawork Home">
                <img src={Logo} alt="SudaWork Logo" className="footer-brand-logo" />
              </Link>
              <div className="footer-social-section">
                <span className="socials-label">تابعنا على:</span>
                <div className="footer-social-icons">
                  <a href="#x" aria-label="X (Twitter)"><FaX /></a>
                  <a href="#linkedin" aria-label="LinkedIn"><FaLinkedin /></a>
                  <a href="#facebook" aria-label="Facebook"><FaFacebook /></a>
                  <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
                  <a href="#tiktok" aria-label="TikTok"><FaTiktok /></a>
                </div>
              </div>
            </div>

            {/* Trust and Selectors */}
            <div className="footer-trust-selectors">
              <div className="trust-badge-pill">
                <FiShield className="trust-icon" />
                <span>ضمان المعاملات البنكية 100%</span>
              </div>
              <button
                type="button"
                className="selector-pill"
                onClick={() => window.dispatchEvent(new CustomEvent('sudawork:open-language'))}
                aria-label="تغيير لغة المنصة"
              >
                <FiGlobe className="selector-icon" />
                <span>العربية (السودان)</span>
              </button>
              <div className="selector-pill currency-pill">
                <span>SDG / ج.س</span>
              </div>
            </div>
          </div>

          {/* Legal Links & Copyright Bar */}
          <div className="footer-legal-bar">
            <p className="footer-copyright">
              © {new Date().getFullYear()} سوداوورك (SudaWork Inc.) — المنصة السودانية الأولى للعمل الحر والضمان البنكي. جميع الحقوق محفوظة.
            </p>

            <div className="footer-legal-links">
              <Link to="/terms" onClick={handleScrollTop}>شروط الاستخدام</Link>
              <span className="legal-dot">•</span>
              <Link to="/privacy" onClick={handleScrollTop}>سياسة الخصوصية</Link>
              <span className="legal-dot">•</span>
              <Link to="/how-it-works" onClick={handleScrollTop}>الضمان والأمان</Link>
              <span className="legal-dot">•</span>
              <Link to="/help" onClick={handleScrollTop}>مركز المساعدة</Link>
              <span className="legal-dot">•</span>
              <Link to="/careers" onClick={handleScrollTop}>الوظائف</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
