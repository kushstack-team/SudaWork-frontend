import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiHelpCircle } from 'react-icons/fi';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper" dir="rtl">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-wrapper">
              <FiAlertTriangle className="error-boundary-icon" />
            </div>

            <h1 className="error-boundary-title">عذراً، حدث خطأ غير متوقع</h1>
            <p className="error-boundary-desc">
              نعتذر عن هذا الخلل المؤقت. بياناتك وحسابك في أمان تام، ويمكنك إعادة تحميل الصفحة أو العودة للصفحة الرئيسية لمتابعة عملك.
            </p>

            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn-error-primary"
                onClick={this.handleReload}
              >
                <FiRefreshCw className="btn-icon" />
                إعادة المحاولة
              </button>

              <button
                type="button"
                className="btn-error-secondary"
                onClick={this.handleGoHome}
              >
                <FiHome className="btn-icon" />
                الصفحة الرئيسية
              </button>
            </div>

            {((typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') || Boolean(import.meta.env?.DEV)) && this.state.error && (
              <details className="error-boundary-debug">
                <summary>
                  <FiHelpCircle className="debug-icon" /> تفاصيل تقنية (وضع التطوير)
                </summary>
                <pre className="debug-content">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
