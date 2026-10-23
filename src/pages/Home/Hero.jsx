import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Hero.css';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * Temporary diagnostic readout: active ONLY when ?debug=neon is in URL.
 * Prints reduced-motion status, Houdini @property support, screen size, DPR, and User Agent.
 */
const NeonDebugReadout = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== 'neon') return;

    const updateInfo = () => {
      const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
      const hasRegisterProperty = Boolean(window.CSS && typeof window.CSS.registerProperty === 'function');
      const houdiniActive = !(typeof document !== 'undefined' && document.documentElement.classList.contains('sw-no-houdini'));

      setDebugInfo({
        prefersReducedMotion: reducedMotion,
        hasCSSRegisterProperty: hasRegisterProperty,
        houdiniActive,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        userAgent: navigator.userAgent,
      });
    };

    updateInfo();
    window.addEventListener('resize', updateInfo);
    return () => window.removeEventListener('resize', updateInfo);
  }, []);

  if (!debugInfo) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(JSON.stringify(debugInfo, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="neon-debug-readout"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '12px',
        right: '12px',
        zIndex: 999999,
        background: 'rgba(0, 25, 18, 0.96)',
        border: '2px solid #00C685',
        borderRadius: '12px',
        padding: '12px 14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '12px',
        direction: 'ltr',
        textAlign: 'left',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ color: '#7DFFC9' }}>⚡ Neon CTA Debug (?debug=neon)</strong>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            background: '#00C685',
            color: '#00251B',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div style={{ lineHeight: 1.5 }}>
        <div><strong>prefers-reduced-motion:</strong> {String(debugInfo.prefersReducedMotion)}</div>
        <div><strong>CSS.registerProperty:</strong> {String(debugInfo.hasCSSRegisterProperty)}</div>
        <div><strong>Mode:</strong> {debugInfo.houdiniActive ? '@property (Houdini)' : 'Fallback (transform: rotate)'}</div>
        <div><strong>Viewport:</strong> {debugInfo.innerWidth}x{debugInfo.innerHeight} @ {debugInfo.devicePixelRatio}x DPR</div>
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px', wordBreak: 'break-all' }}>
          <strong>UA:</strong> {debugInfo.userAgent}
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supportsHoudini = Boolean(window.CSS && typeof window.CSS.registerProperty === 'function');
    if (!supportsHoudini) {
      document.documentElement.classList.add('sw-no-houdini');
    } else {
      document.documentElement.classList.remove('sw-no-houdini');
    }
  }, []);

  const handleTagClick = (keyword) => {
    navigate(`/projects?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <section className="hero">
      <NeonDebugReadout />
      <div className="hero-container">
        <h1 className="hero-headline">
          تواصل مع أفضل المستقلين <br />
          <span className="accent-text">في السودان</span>
        </h1>
        
        <p className="hero-description">
          انشر مشروعك الآن واستقبل عروضاً مخصصة من نخبة الكفاءات والمحترفين، مع ضمان مالي كامل وحماية لجميع مراحل العمل.
        </p>

        {/* Primary Neon CTA Button for Project Owners */}
        <div className="hero-cta-wrapper">
          <span className="sw-cta-wrap">
            <Link to="/post-project" className="sw-cta hero-cta-neon" id="hero-main-cta">
              <span className="cta-text">ابدأ مشروعك الآن</span>
              <FiArrowLeft className="cta-arrow" />
            </Link>
          </span>
        </div>

        {/* Secondary Search & Categories */}
        <div className="hero-search-wrapper">
          <SearchBar placeholder="ابحث عن اي خدمة...." className="hero-search" />
        </div>

        <div className="hero-tags">
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('فيديو')}
          >
            تعديل الفيديوهات
            <FiArrowLeft className="arrow-icon" />
          </Button>
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('تصميم')}
          >
            تصميم
            <FiArrowLeft className="arrow-icon" />
          </Button>
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('تسويق')}
          >
            تسويق
            <FiArrowLeft className="arrow-icon" />
          </Button>
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('تطوير مواقع')}
          >
            تطوير المواقع الاكترونية
            <FiArrowLeft className="arrow-icon" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
