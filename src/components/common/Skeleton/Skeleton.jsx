import './Skeleton.css';

/**
 * Loading placeholders shaped like the content they stand in for, so the
 * layout doesn't jump when data arrives. Every preset is wrapped in
 * <LoadingRegion>, which announces `label` to screen readers once.
 */

const range = (n) => Array.from({ length: n }, (_, i) => i);

// ---------- primitives ----------

export function Skeleton({ width = '100%', height = 14, radius = 6, circle = false, className = '', style }) {
  const size = circle ? { width: height, height, borderRadius: '50%' } : { width, height, borderRadius: radius };
  return <span className={`sk ${className}`} style={{ ...size, ...style }} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, lastWidth = '60%', gap = 10, height = 12 }) {
  return (
    <span className="sk-text" style={{ gap }} aria-hidden="true">
      {range(lines).map((i) => (
        <Skeleton key={i} height={height} width={i === lines - 1 && lines > 1 ? lastWidth : '100%'} />
      ))}
    </span>
  );
}

export function LoadingRegion({ label = 'جاري التحميل...', className = '', children }) {
  return (
    <div className={`sk-region ${className}`} role="status" aria-live="polite" aria-busy="true">
      <span className="sk-sr-only">{label}</span>
      {children}
    </div>
  );
}

// ---------- presets ----------

const Chips = ({ count = 3 }) => (
  <span className="sk-row sk-row--wrap" aria-hidden="true">
    {range(count).map((i) => <Skeleton key={i} width={64 + (i % 2) * 22} height={24} radius={12} />)}
  </span>
);

/** Stacked cards: projects, contracts, proposals, disputes, payments. */
export function CardListSkeleton({ count = 3, label, withAvatar = false }) {
  return (
    <LoadingRegion label={label} className="sk-stack">
      {range(count).map((i) => (
        <div key={i} className="sk-card">
          <div className="sk-row sk-row--between">
            <span className="sk-row">
              {withAvatar && <Skeleton circle height={40} />}
              <Skeleton width={i % 2 ? 180 : 240} height={18} />
            </span>
            <Skeleton width={84} height={26} radius={13} />
          </div>
          <SkeletonText lines={2} lastWidth="45%" />
          <div className="sk-row sk-row--between">
            <Chips count={3} />
            <Skeleton width={110} height={34} radius={8} />
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Grid of person cards: freelancer directory, talent suggestions. */
export function PeopleGridSkeleton({ count = 6, label }) {
  return (
    <LoadingRegion label={label} className="sk-grid">
      {range(count).map((i) => (
        <div key={i} className="sk-card sk-card--center">
          <Skeleton circle height={64} />
          <Skeleton width="55%" height={16} />
          <Skeleton width="40%" height={12} />
          <Chips count={2} />
          <Skeleton width="100%" height={36} radius={8} />
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Rows: transactions, notifications, conversation threads. */
export function RowListSkeleton({ count = 5, label, variant = 'row' }) {
  const avatar = variant === 'thread' ? 44 : variant === 'notification' ? 38 : 0;
  return (
    <LoadingRegion label={label} className={`sk-rows sk-rows--${variant}`}>
      {range(count).map((i) => (
        <div key={i} className="sk-list-row">
          {avatar > 0 && <Skeleton circle height={avatar} />}
          <span className="sk-col">
            <Skeleton width={i % 2 ? '45%' : '60%'} height={14} />
            <Skeleton width={i % 3 ? '80%' : '65%'} height={11} />
          </span>
          {variant === 'row' && <Skeleton width={90} height={22} radius={11} />}
          {variant === 'thread' && <Skeleton width={36} height={10} />}
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Public profile: hero card, then side cards and content sections. */
export function ProfileSkeleton({ label }) {
  return (
    <LoadingRegion label={label} className="sk-page">
      <div className="sk-card sk-hero">
        <Skeleton circle height={104} />
        <span className="sk-col sk-grow">
          <Skeleton width="40%" height={24} />
          <Skeleton width="28%" height={14} />
          <Chips count={3} />
        </span>
        <Skeleton width={140} height={44} radius={10} className="sk-hide-sm" />
      </div>
      <div className="sk-split">
        <aside className="sk-col">
          {range(2).map((i) => (
            <div key={i} className="sk-card">
              <Skeleton width="50%" height={16} />
              <SkeletonText lines={3} />
            </div>
          ))}
        </aside>
        <section className="sk-col">
          {range(2).map((i) => (
            <div key={i} className="sk-card">
              <Skeleton width="30%" height={18} />
              <SkeletonText lines={4} />
            </div>
          ))}
        </section>
      </div>
    </LoadingRegion>
  );
}

/** Detail pages (project, contract): header, body and a side summary. */
export function DetailsSkeleton({ label }) {
  return (
    <LoadingRegion label={label} className="sk-page">
      <Skeleton width={220} height={12} />
      <div className="sk-card">
        <div className="sk-row sk-row--between">
          <Skeleton width="55%" height={26} />
          <Skeleton width={96} height={28} radius={14} />
        </div>
        <Chips count={4} />
      </div>
      <div className="sk-split sk-split--main-first">
        <section className="sk-col">
          <div className="sk-card">
            <Skeleton width="25%" height={18} />
            <SkeletonText lines={5} lastWidth="70%" />
          </div>
          <div className="sk-card">
            <Skeleton width="30%" height={18} />
            <SkeletonText lines={3} />
          </div>
        </section>
        <aside className="sk-col">
          <div className="sk-card">
            <Skeleton width="45%" height={16} />
            {range(4).map((i) => (
              <span key={i} className="sk-row sk-row--between">
                <Skeleton width="35%" height={12} />
                <Skeleton width="30%" height={12} />
              </span>
            ))}
            <Skeleton width="100%" height={42} radius={10} />
          </div>
        </aside>
      </div>
    </LoadingRegion>
  );
}

/** Settings / edit forms: section cards with labelled inputs. */
export function FormSkeleton({ label, sections = 2 }) {
  return (
    <LoadingRegion label={label} className="sk-page">
      <div className="sk-row sk-row--between">
        <span className="sk-col">
          <Skeleton width={260} height={24} />
          <Skeleton width={340} height={12} />
        </span>
        <Skeleton width={150} height={40} radius={10} className="sk-hide-sm" />
      </div>
      {range(sections).map((s) => (
        <div key={s} className="sk-card">
          <Skeleton width="28%" height={18} />
          {s === 0 && (
            <span className="sk-row">
              <Skeleton circle height={80} />
              <span className="sk-col sk-grow">
                <Skeleton width="30%" height={14} />
                <Skeleton width="55%" height={11} />
              </span>
            </span>
          )}
          <div className="sk-form-grid">
            {range(4).map((i) => (
              <span key={i} className="sk-col">
                <Skeleton width="35%" height={12} />
                <Skeleton width="100%" height={44} radius={10} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}

/** Long-form text: terms, privacy policy. */
export function ArticleSkeleton({ label, paragraphs = 4 }) {
  return (
    <LoadingRegion label={label} className="sk-col sk-article">
      {range(paragraphs).map((i) => (
        <span key={i} className="sk-col">
          <Skeleton width={i === 0 ? '45%' : '30%'} height={18} />
          <SkeletonText lines={4} lastWidth={i % 2 ? '50%' : '75%'} />
        </span>
      ))}
    </LoadingRegion>
  );
}

/** Small tiles: category shortcuts. */
export function TileGridSkeleton({ count = 8, label }) {
  return (
    <LoadingRegion label={label} className="sk-tiles">
      {range(count).map((i) => (
        <div key={i} className="sk-card sk-card--center sk-tile">
          <Skeleton circle height={44} />
          <Skeleton width="70%" height={12} />
        </div>
      ))}
    </LoadingRegion>
  );
}
