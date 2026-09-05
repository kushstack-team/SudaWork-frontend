import React, { useState, useEffect } from 'react';
import './NetworkStatus.css';
import { FiWifiOff, FiCheckCircle } from 'react-icons/fi';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <aside className="network-status-container" dir="rtl" role="status" aria-live="polite">
      {!isOnline && (
        <div className="network-banner offline">
          <div className="network-banner-content">
            <FiWifiOff className="network-icon pulse" />
            <span>
              تعذر الاتصال بالإنترنت. منصة سوداوورك تعمل حالياً بالوضع المحلي المحفوظ، وسيتم تحديث البيانات فور استقرار الشبكة.
            </span>
          </div>
        </div>
      )}

      {isOnline && showReconnected && (
        <div className="network-banner online">
          <div className="network-banner-content">
            <FiCheckCircle className="network-icon" />
            <span>تم استعادة الاتصال بالإنترنت بنجاح! تم تحديث البيانات.</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default NetworkStatus;
