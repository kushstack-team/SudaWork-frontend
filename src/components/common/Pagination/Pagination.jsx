import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

// Page numbers to show: always the first and last, the current page and its
// neighbours, and "…" for the gaps. e.g. 1 … 4 5 6 … 57
const pageItems = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, Math.min(page - 1, total - 4));
  const end = Math.min(total - 1, Math.max(page + 1, 5));
  if (start > 2) items.push('gap-start');
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push('gap-end');
  items.push(total);
  return items;
};

/**
 * Numbered pagination (RTL): « السابق  1 … 4 5 6 … 57  التالي ».
 * On phones only the arrows and "صفحة 5 من 57" are shown.
 */
export default function Pagination({ page, totalPages, onChange, label = 'التنقل بين الصفحات' }) {
  if (!totalPages || totalPages <= 1) return null;
  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  return (
    <nav className="sw-pagination" aria-label={label}>
      <button
        type="button"
        className="sw-pagination__nav"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        <FiChevronRight aria-hidden="true" />
        <span>السابق</span>
      </button>

      <ol className="sw-pagination__pages">
        {pageItems(page, totalPages).map((item) => (
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`sw-pagination__page ${item === page ? 'is-current' : ''}`}
                onClick={() => go(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`الصفحة ${item}`}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="sw-pagination__gap" aria-hidden="true">…</li>
          )
        ))}
      </ol>

      <span className="sw-pagination__status" aria-live="polite">
        صفحة <strong>{page}</strong> من {totalPages}
      </span>

      <button
        type="button"
        className="sw-pagination__nav"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="الصفحة التالية"
      >
        <span>التالي</span>
        <FiChevronLeft aria-hidden="true" />
      </button>
    </nav>
  );
}
