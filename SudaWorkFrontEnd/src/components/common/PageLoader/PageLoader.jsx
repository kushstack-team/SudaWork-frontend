import React from 'react';
import './PageLoader.css';

export default function PageLoader({ message = 'جاري التحميل...' }) {
  return (
    <div className="page-loader-container" role="status" aria-live="polite">
      <div className="page-loader-spinner" />
      <p className="page-loader-text">{message}</p>
    </div>
  );
}
