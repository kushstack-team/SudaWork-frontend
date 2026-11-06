import { FiStar } from 'react-icons/fi';
import './RatingBadge.css';

/**
 * Average rating with the number of reviews: "★ 5.0 (1)". Accounts without
 * reviews show a "جديد" (new) tag instead of an empty star.
 */
export default function RatingBadge({ rating, count, size = 'md', className = '' }) {
  const reviews = Number(count) || 0;
  if (reviews === 0) {
    return <span className={`rating-badge-new rating-badge--${size} ${className}`}>جديد</span>;
  }
  const score = Number(rating || 0).toFixed(1);
  return (
    <span className={`rating-badge-ui rating-badge--${size} ${className}`} aria-label={`التقييم ${score} من 5، ${reviews} تقييم`}>
      <FiStar className="rating-badge-ui__star" aria-hidden="true" />
      <strong className="rating-badge-ui__score">{score}</strong>
      <span className="rating-badge-ui__count">({reviews})</span>
    </span>
  );
}
