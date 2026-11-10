import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import Logo from '../../components/Logo/Logo';
import { api } from '../../services/api';
import './Unsubscribe.css';

/**
 * Opened from the link at the bottom of campaign emails. Opening the page
 * changes nothing (mail scanners open links); the person confirms with a
 * button, and can subscribe again. Account emails are not affected.
 */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = { u: params.get('u') || '', t: params.get('t') || '' };
  const hasToken = Boolean(token.u && token.t);

  const [state, setState] = useState(hasToken ? 'loading' : 'invalid'); // loading | ready | invalid | error
  const [info, setInfo] = useState(null); // { email, subscribed }
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!hasToken) return undefined;
    let cancelled = false;
    api.email.unsubscribeStatus(token).then(
      (data) => {
        if (cancelled) return;
        setInfo(data);
        setState('ready');
      },
      (err) => {
        if (cancelled) return;
        setState(err.status === 400 || err.status === 404 ? 'invalid' : 'error');
      }
    );
    return () => {
      cancelled = true;
    };
    // The token comes from the URL once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  const change = async (subscribe) => {
    setSaving(true);
    try {
      const data = subscribe ? await api.email.resubscribe(token) : await api.email.unsubscribe(token);
      setInfo(data);
      setDone(subscribe ? 'resubscribed' : 'unsubscribed');
    } catch {
      setState('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="unsub-page" dir="rtl">
      <header className="unsub-header">
        <Link to="/" aria-label="الصفحة الرئيسية"><Logo /></Link>
      </header>
      <main className="unsub-main">
        <div className="unsub-card">
          {state === 'loading' && (
            <div className="unsub-loading" role="status"><span className="unsub-spinner" aria-hidden="true" /> جارٍ التحميل...</div>
          )}

          {state === 'invalid' && (
            <>
              <span className="unsub-icon is-warn"><FiAlertTriangle /></span>
              <h1>الرابط غير صالح</h1>
              <p>تأكد من فتح الرابط كاملاً من الرسالة. يمكنك أيضاً إيقاف الرسائل من إعدادات حسابك بعد تسجيل الدخول.</p>
              <Link to="/login" className="unsub-btn">تسجيل الدخول</Link>
            </>
          )}

          {state === 'error' && (
            <>
              <span className="unsub-icon is-warn"><FiAlertTriangle /></span>
              <h1>تعذر إتمام الطلب</h1>
              <p>حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى بعد قليل.</p>
              <button type="button" className="unsub-btn" onClick={() => window.location.reload()}>إعادة المحاولة</button>
            </>
          )}

          {state === 'ready' && info && (
            info.subscribed ? (
              <>
                <span className="unsub-icon"><FiMail /></span>
                <h1>{done === 'resubscribed' ? 'تمت إعادة اشتراكك' : 'إيقاف رسائل سوداوورك؟'}</h1>
                <p>
                  {done === 'resubscribed'
                    ? `ستصل رسائلنا مجدداً إلى ${info.email}.`
                    : `لن تصل بعد الآن رسائل العروض والنصائح إلى ${info.email}. ستستمر رسائل حسابك المهمة مثل تأكيد البريد واستعادة كلمة المرور.`}
                </p>
                {done !== 'resubscribed' && (
                  <button type="button" className="unsub-btn is-danger" onClick={() => change(false)} disabled={saving}>
                    {saving ? 'جارٍ الحفظ...' : 'نعم، أوقف الرسائل'}
                  </button>
                )}
                <Link to="/" className="unsub-link">العودة إلى سوداوورك</Link>
              </>
            ) : (
              <>
                <span className="unsub-icon is-ok"><FiCheckCircle /></span>
                <h1>تم إلغاء اشتراكك</h1>
                <p>لن تصل رسائل العروض والنصائح إلى {info.email} بعد الآن. إن كان ذلك بالخطأ يمكنك إعادة الاشتراك.</p>
                <button type="button" className="unsub-btn is-outline" onClick={() => change(true)} disabled={saving}>
                  {saving ? 'جارٍ الحفظ...' : 'إعادة الاشتراك'}
                </button>
                <Link to="/" className="unsub-link">العودة إلى سوداوورك</Link>
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}
