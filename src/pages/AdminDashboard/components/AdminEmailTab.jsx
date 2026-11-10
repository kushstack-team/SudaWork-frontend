import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FiUsers,
  FiUserX,
  FiCheckCircle,
  FiSlash,
  FiSearch,
  FiEye,
  FiSend,
  FiMail,
  FiX,
  FiPause,
  FiPlay,
  FiChevronRight,
  FiChevronLeft,
  FiAlertTriangle,
  FiEdit3,
} from 'react-icons/fi';
import { api } from '../../../services/api';
import { formatDate } from '../../../utils/formatters';
import defaultAvatar from '../../../assets/default-avatar.svg';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './AdminEmail.css';

const PAGE_SIZE = 25;
const CAMPAIGN_POLL_MS = 4000;

const SEGMENTS = [
  { id: 'never_posted', label: 'لم ينشروا أي مشروع', summaryKey: 'never_posted', eligibleKey: 'eligible_never_posted' },
  { id: 'posted', label: 'نشروا مشاريع', summaryKey: 'posted', eligibleKey: 'eligible_posted' },
  { id: 'all', label: 'كل العملاء', summaryKey: 'total', eligibleKey: 'eligible' },
];

const SUGGESTED = {
  subject: '{{name}}، مشروعك القادم يبدأ على سوداوورك',
  message:
    'لاحظنا أنك انضممت إلى سوداوورك ولم تنشر مشروعك الأول بعد.\n\n' +
    'سواء كنت تحتاج تصميم شعار، أو موقعاً إلكترونياً، أو ترجمة، أو أي عمل آخر، يمكنك نشر مشروعك مجاناً خلال دقائق، وستصلك عروض من مستقلين سودانيين محترفين.\n\n' +
    'أموالك في أمان: يُحفظ المبلغ لدى المنصة ولا يُحوَّل للمستقل إلا بعد موافقتك على العمل.',
  ctaLabel: 'انشر مشروعك الآن',
  ctaUrl: '',
};

const STATUS_META = {
  SENDING: { label: 'جارٍ الإرسال', tone: 'info' },
  PAUSED: { label: 'متوقفة مؤقتاً', tone: 'warn' },
  COMPLETED: { label: 'اكتملت', tone: 'ok' },
  CANCELLED: { label: 'أُلغيت', tone: 'muted' },
};

const PROBLEM_LABELS = {
  unsubscribed: 'ألغى الاشتراك قبل الإرسال',
  'account inactive': 'الحساب غير نشط',
};

const audienceLabel = (audience) => {
  if (audience?.userIds) return `عملاء محددون (${audience.userIds.length})`;
  return SEGMENTS.find((s) => s.id === audience?.segment)?.label || '—';
};

const receiveState = (c) => {
  if (c.unsubscribed) return { label: 'ألغى الاشتراك', tone: 'muted' };
  if (!c.emailVerified) return { label: 'بريد غير مؤكد', tone: 'muted' };
  if (!c.isActive) return { label: 'حساب معطّل', tone: 'muted' };
  return { label: 'يستقبل الرسائل', tone: 'ok' };
};

/**
 * Email campaigns to clients: pick the audience (by whether they have posted a
 * project, or by hand), write the message, preview, send a test, then send.
 * Sending runs on the server in the background; progress shows below.
 */
export default function AdminEmailTab({ onSuccess: onSuccessProp, onError: onErrorProp }) {
  // The dashboard recreates these callbacks on every render; a ref keeps the
  // data loaders below stable.
  const callbacks = useRef({ onSuccess: onSuccessProp, onError: onErrorProp });
  useLayoutEffect(() => {
    callbacks.current = { onSuccess: onSuccessProp, onError: onErrorProp };
  });
  const onSuccess = useCallback((msg) => callbacks.current.onSuccess?.(msg), []);
  const onError = useCallback((msg) => callbacks.current.onError?.(msg), []);

  // ---------- Audience ----------
  const [segment, setSegment] = useState('never_posted');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [audience, setAudience] = useState({ items: [], total: 0, totalPages: 1, summary: {} });
  const [audienceState, setAudienceState] = useState('loading');
  const [mode, setMode] = useState('segment'); // segment | selected
  const [selected, setSelected] = useState(() => new Map());

  // ---------- Message ----------
  const [subject, setSubject] = useState(SUGGESTED.subject);
  const [message, setMessage] = useState(SUGGESTED.message);
  const [ctaLabel, setCtaLabel] = useState(SUGGESTED.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(SUGGESTED.ctaUrl);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(''); // preview | test | count | send
  const [confirm, setConfirm] = useState(null); // { count, audience }

  // ---------- History ----------
  const [campaigns, setCampaigns] = useState([]);
  const [openCampaign, setOpenCampaign] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadAudience = useCallback(async () => {
    setAudienceState((s) => (s === 'ready' ? 'refreshing' : 'loading'));
    try {
      const data = await api.admin.emailAudience({ segment, search: debouncedSearch || undefined, page, limit: PAGE_SIZE });
      setAudience(data);
      setAudienceState('ready');
    } catch (err) {
      setAudienceState('error');
      onError?.(err.message);
    }
  }, [segment, debouncedSearch, page, onError]);

  useEffect(() => {
    const t = setTimeout(loadAudience, 0);
    return () => clearTimeout(t);
  }, [loadAudience]);

  const loadCampaigns = useCallback(async () => {
    try {
      const data = await api.admin.emailCampaigns({ limit: 20 });
      setCampaigns(data.items);
    } catch { /* the list keeps its last state */ }
  }, []);

  const hasActive = campaigns.some((c) => c.status === 'SENDING');
  useEffect(() => {
    const first = setTimeout(loadCampaigns, 0);
    const timer = hasActive ? setInterval(() => !document.hidden && loadCampaigns(), CAMPAIGN_POLL_MS) : null;
    return () => {
      clearTimeout(first);
      if (timer) clearInterval(timer);
    };
  }, [loadCampaigns, hasActive]);

  const summary = audience.summary || {};
  const activeSegment = SEGMENTS.find((s) => s.id === segment);
  const segmentEligible = summary[activeSegment.eligibleKey] ?? 0;

  const toggleOne = (client) => {
    if (!client.canReceive) return;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(client.id)) next.delete(client.id);
      else next.set(client.id, client);
      return next;
    });
    setMode('selected');
  };

  const selectableOnPage = audience.items.filter((c) => c.canReceive);
  const allPageSelected = selectableOnPage.length > 0 && selectableOnPage.every((c) => selected.has(c.id));
  const togglePage = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allPageSelected) selectableOnPage.forEach((c) => next.delete(c.id));
      else selectableOnPage.forEach((c) => next.set(c.id, c));
      return next;
    });
    setMode('selected');
  };

  const chosenAudience = useMemo(
    () => (mode === 'selected' ? { userIds: [...selected.keys()] } : { segment }),
    [mode, selected, segment]
  );
  const plannedCount = mode === 'selected' ? selected.size : segmentEligible;

  const content = () => ({
    subject: subject.trim(),
    message: message.trim(),
    ctaLabel: ctaLabel.trim(),
    ctaUrl: ctaUrl.trim(),
  });

  const contentError = (() => {
    if (subject.trim().length < 3) return 'اكتب عنواناً للرسالة (3 أحرف على الأقل).';
    if (message.trim().length < 10) return 'اكتب نص الرسالة (10 أحرف على الأقل).';
    if (ctaUrl.trim() && !/^https?:\/\/\S+$/i.test(ctaUrl.trim())) return 'رابط الزر يجب أن يبدأ بـ https://';
    return '';
  })();

  const handlePreview = async () => {
    if (contentError) return onError?.(contentError);
    setBusy('preview');
    try {
      setPreview(await api.admin.emailPreview(content()));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setBusy('');
    }
  };

  const handleTest = async () => {
    if (contentError) return onError?.(contentError);
    setBusy('test');
    try {
      const result = await api.admin.emailTest(content());
      onSuccess?.(`تم إرسال رسالة تجريبية إلى ${result.sentTo}. تحقق من بريدك (ومجلد الرسائل غير المرغوب فيها).`);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setBusy('');
    }
  };

  // The server gives the exact number; that number must match on send.
  const handleReview = async () => {
    if (contentError) return onError?.(contentError);
    if (mode === 'selected' && selected.size === 0) return onError?.('اختر عميلاً واحداً على الأقل، أو أرسل إلى كل العملاء في التصنيف.');
    setBusy('count');
    try {
      const count = await api.admin.emailAudienceCount(chosenAudience);
      if (count === 0) {
        onError?.('لا يوجد عميل يمكنه استلام هذه الحملة (ربما ألغوا الاشتراك أو لم يؤكدوا بريدهم).');
        return;
      }
      setConfirm({ count, audience: chosenAudience });
    } catch (err) {
      onError?.(err.message);
    } finally {
      setBusy('');
    }
  };

  const handleSend = async () => {
    if (!confirm) return;
    setBusy('send');
    try {
      await api.admin.createEmailCampaign({ ...content(), audience: confirm.audience, expectedRecipients: confirm.count });
      setConfirm(null);
      setSelected(new Map());
      setMode('segment');
      onSuccess?.(`بدأ إرسال الحملة إلى ${confirm.count.toLocaleString('en-US')} عميل. يمكنك متابعة التقدم في سجل الحملات.`);
      loadCampaigns();
    } catch (err) {
      setConfirm(null);
      onError?.(err.code === 'AUDIENCE_CHANGED' ? 'تغيّر عدد المستلمين منذ المراجعة. راجع الحملة وأكّد مرة أخرى.' : err.message);
    } finally {
      setBusy('');
    }
  };

  const campaignAction = async (fn, successMsg) => {
    try {
      const updated = await fn();
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (openCampaign?.id === updated.id) setOpenCampaign(updated);
      onSuccess?.(successMsg);
      loadCampaigns();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const showDetails = async (c) => {
    if (openCampaign?.id === c.id) return setOpenCampaign(null);
    try {
      setOpenCampaign(await api.admin.emailCampaign(c.id));
    } catch (err) {
      onError?.(err.message);
    }
  };

  const insertName = () => setMessage((m) => `${m}${m.endsWith(' ') || !m ? '' : ' '}{{name}}`);

  return (
    <div className="admin-tab-content admin-email">
      {/* Summary */}
      <div className="email-summary">
        <button type="button" className={`email-stat ${segment === 'all' ? 'is-active' : ''}`} onClick={() => { setSegment('all'); setPage(1); }}>
          <span className="email-stat__icon"><FiUsers /></span>
          <span className="email-stat__value">{(summary.total ?? 0).toLocaleString('en-US')}</span>
          <span className="email-stat__label">كل العملاء</span>
        </button>
        <button type="button" className={`email-stat is-amber ${segment === 'never_posted' ? 'is-active' : ''}`} onClick={() => { setSegment('never_posted'); setPage(1); }}>
          <span className="email-stat__icon"><FiUserX /></span>
          <span className="email-stat__value">{(summary.never_posted ?? 0).toLocaleString('en-US')}</span>
          <span className="email-stat__label">لم ينشروا أي مشروع</span>
        </button>
        <button type="button" className={`email-stat is-green ${segment === 'posted' ? 'is-active' : ''}`} onClick={() => { setSegment('posted'); setPage(1); }}>
          <span className="email-stat__icon"><FiCheckCircle /></span>
          <span className="email-stat__value">{(summary.posted ?? 0).toLocaleString('en-US')}</span>
          <span className="email-stat__label">نشروا مشاريع</span>
        </button>
        <div className="email-stat is-muted">
          <span className="email-stat__icon"><FiSlash /></span>
          <span className="email-stat__value">{(summary.unsubscribed ?? 0).toLocaleString('en-US')}</span>
          <span className="email-stat__label">ألغوا الاشتراك</span>
        </div>
      </div>

      {/* Step 1: audience */}
      <section className="admin-card-section email-card">
        <header className="email-card__head">
          <span className="email-step">1</span>
          <div>
            <h3 className="section-title">اختر المستلمين</h3>
            <p className="section-desc">
              لا تصل الحملات إلى من ألغى الاشتراك أو لم يؤكد بريده أو حسابه معطّل؛ يظهرون في القائمة ولا يمكن تحديدهم.
            </p>
          </div>
        </header>

        <div className="email-toolbar">
          <div className="email-segments" role="tablist" aria-label="تصنيف العملاء">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={segment === s.id}
                className={`email-segment ${segment === s.id ? 'is-active' : ''}`}
                onClick={() => { setSegment(s.id); setPage(1); }}
              >
                {s.label}
                <span className="email-segment__count">{(summary[s.summaryKey] ?? 0).toLocaleString('en-US')}</span>
              </button>
            ))}
          </div>
          <label className="email-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد"
              aria-label="ابحث عن عميل"
            />
          </label>
        </div>

        <div className="email-mode" role="radiogroup" aria-label="من سيستلم الحملة">
          <label className={`email-mode__option ${mode === 'segment' ? 'is-active' : ''}`}>
            <input type="radio" name="email-mode" checked={mode === 'segment'} onChange={() => setMode('segment')} />
            <span>
              <strong>كل «{activeSegment.label}»</strong>
              <small>{segmentEligible.toLocaleString('en-US')} عميل يمكنهم الاستلام</small>
            </span>
          </label>
          <label className={`email-mode__option ${mode === 'selected' ? 'is-active' : ''}`}>
            <input type="radio" name="email-mode" checked={mode === 'selected'} onChange={() => setMode('selected')} />
            <span>
              <strong>العملاء الذين أحددهم فقط</strong>
              <small>
                {selected.size.toLocaleString('en-US')} محدد
                {selected.size > 0 && (
                  <button type="button" className="email-link-btn" onClick={(e) => { e.preventDefault(); setSelected(new Map()); }}>
                    مسح التحديد
                  </button>
                )}
              </small>
            </span>
          </label>
        </div>

        <div className="admin-table-wrapper email-table-wrap" aria-busy={audienceState !== 'ready'}>
          <table className="admin-table email-table">
            <thead>
              <tr>
                <th className="email-col-check">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePage}
                    disabled={selectableOnPage.length === 0}
                    aria-label="تحديد كل عملاء هذه الصفحة"
                  />
                </th>
                <th>العميل</th>
                <th>المشاريع المنشورة</th>
                <th>تاريخ التسجيل</th>
                <th>البريد</th>
              </tr>
            </thead>
            <tbody>
              {audienceState === 'loading' && (
                <tr><td colSpan="5" className="empty-table-cell">جارٍ تحميل العملاء...</td></tr>
              )}
              {audienceState === 'error' && (
                <tr><td colSpan="5" className="empty-table-cell">تعذر تحميل العملاء. <button type="button" className="email-link-btn" onClick={loadAudience}>إعادة المحاولة</button></td></tr>
              )}
              {audienceState !== 'loading' && audienceState !== 'error' && audience.items.length === 0 && (
                <tr><td colSpan="5" className="empty-table-cell">لا يوجد عملاء مطابقون.</td></tr>
              )}
              {audienceState !== 'loading' && audienceState !== 'error' && audience.items.map((c) => {
                const state = receiveState(c);
                return (
                  <tr key={c.id} className={c.canReceive ? '' : 'is-disabled'}>
                    <td className="email-col-check">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleOne(c)}
                        disabled={!c.canReceive}
                        aria-label={`تحديد ${c.fullName}`}
                      />
                    </td>
                    <td>
                      <div className="email-client">
                        <img src={c.avatar || defaultAvatar} alt="" className="email-client__avatar" />
                        <div className="email-client__text">
                          <strong>{c.fullName}</strong>
                          <span dir="ltr">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {c.projectsCount === 0 ? (
                        <span className="email-pill is-amber">لم ينشر بعد</span>
                      ) : (
                        <span className="email-pill is-green">
                          {c.projectsCount === 1 ? 'مشروع واحد' : c.projectsCount === 2 ? 'مشروعان' : `${c.projectsCount} مشاريع`}
                        </span>
                      )}
                      {c.lastProjectAt && <div className="email-sub">آخر مشروع: {formatDate(c.lastProjectAt)}</div>}
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td><span className={`email-pill is-${state.tone}`}>{state.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {audience.totalPages > 1 && (
          <nav className="email-pager" aria-label="صفحات العملاء">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <FiChevronRight aria-hidden="true" /> السابق
            </button>
            <span>صفحة {page} من {audience.totalPages} · {audience.total.toLocaleString('en-US')} عميل</span>
            <button type="button" onClick={() => setPage((p) => Math.min(audience.totalPages, p + 1))} disabled={page >= audience.totalPages}>
              التالي <FiChevronLeft aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>

      {/* Step 2: message */}
      <section className="admin-card-section email-card">
        <header className="email-card__head">
          <span className="email-step">2</span>
          <div>
            <h3 className="section-title">اكتب الرسالة</h3>
            <p className="section-desc">اكتب بأسلوب بسيط وواضح. يُضاف الترحيب باسم العميل ورابط إلغاء الاشتراك تلقائياً.</p>
          </div>
          <button type="button" className="email-ghost-btn" onClick={() => { setSubject(SUGGESTED.subject); setMessage(SUGGESTED.message); setCtaLabel(SUGGESTED.ctaLabel); setCtaUrl(''); }}>
            <FiEdit3 aria-hidden="true" /> استخدام النص المقترح
          </button>
        </header>

        <div className="email-form">
          <label className="email-field">
            <span>عنوان الرسالة <em>*</em></span>
            <input type="text" value={subject} maxLength={150} onChange={(e) => setSubject(e.target.value)} placeholder="مثال: مشروعك القادم يبدأ على سوداوورك" />
            <small>{subject.length}/150 · يظهر في صندوق الوارد، فاجعله قصيراً ومشوّقاً.</small>
          </label>

          <label className="email-field">
            <span className="email-field__row">
              <span>نص الرسالة <em>*</em></span>
              <button type="button" className="email-link-btn" onClick={insertName}>إدراج اسم العميل</button>
            </span>
            <textarea rows={8} value={message} maxLength={5000} onChange={(e) => setMessage(e.target.value)} />
            <small>اترك سطراً فارغاً لبدء فقرة جديدة. ‎{'{{name}}'}‎ يُستبدل باسم العميل الأول. {message.length}/5000</small>
          </label>

          <div className="email-form__row">
            <label className="email-field">
              <span>نص الزر</span>
              <input type="text" value={ctaLabel} maxLength={60} onChange={(e) => setCtaLabel(e.target.value)} placeholder="انشر مشروعك الآن" />
            </label>
            <label className="email-field">
              <span>رابط الزر (اختياري)</span>
              <input type="url" dir="ltr" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://www.sudawork.com/post-project" />
              <small>إذا تركته فارغاً يفتح الزر صفحة نشر مشروع جديد.</small>
            </label>
          </div>

          {contentError && <p className="email-hint-error"><FiAlertTriangle aria-hidden="true" /> {contentError}</p>}

          <div className="email-actions">
            <button type="button" className="email-ghost-btn" onClick={handlePreview} disabled={Boolean(busy)}>
              <FiEye aria-hidden="true" /> {busy === 'preview' ? 'جارٍ التحضير...' : 'معاينة الرسالة'}
            </button>
            <button type="button" className="email-ghost-btn" onClick={handleTest} disabled={Boolean(busy)}>
              <FiMail aria-hidden="true" /> {busy === 'test' ? 'جارٍ الإرسال...' : 'إرسال تجربة إلى بريدي'}
            </button>
            <button type="button" className="email-primary-btn" onClick={handleReview} disabled={Boolean(busy) || plannedCount === 0}>
              <FiSend aria-hidden="true" />
              {busy === 'count' ? 'جارٍ التحقق...' : `مراجعة وإرسال إلى ${plannedCount.toLocaleString('en-US')} عميل`}
            </button>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="admin-card-section email-card">
        <header className="email-card__head">
          <span className="email-step is-icon"><FiMail aria-hidden="true" /></span>
          <div>
            <h3 className="section-title">سجل الحملات</h3>
            <p className="section-desc">يتم الإرسال تدريجياً في الخلفية. يمكنك إغلاق الصفحة وسيستمر الإرسال.</p>
          </div>
        </header>

        {campaigns.length === 0 ? (
          <p className="email-empty">لم تُرسل أي حملة بعد.</p>
        ) : (
          <ul className="email-campaigns">
            {campaigns.map((c) => {
              const meta = STATUS_META[c.status] || { label: c.status, tone: 'muted' };
              const done = c.sent + c.failed + c.skipped;
              const pct = c.total ? Math.round((done / c.total) * 100) : 0;
              const isOpen = openCampaign?.id === c.id;
              return (
                <li key={c.id} className="email-campaign">
                  <div className="email-campaign__top">
                    <div className="email-campaign__title">
                      <strong>{c.subject}</strong>
                      <span>{audienceLabel(c.audience)} · {formatDate(c.createdAt)}{c.createdByName ? ` · ${c.createdByName}` : ''}</span>
                    </div>
                    <span className={`email-pill is-${meta.tone}`}>{meta.label}</span>
                  </div>
                  <div className="email-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="تقدم الإرسال">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <div className="email-campaign__stats">
                    <span className="is-ok">أُرسلت: {c.sent.toLocaleString('en-US')}</span>
                    {c.failed > 0 && <span className="is-bad">فشلت: {c.failed.toLocaleString('en-US')}</span>}
                    {c.skipped > 0 && <span>تم تخطيها: {c.skipped.toLocaleString('en-US')}</span>}
                    <span>من {c.total.toLocaleString('en-US')}</span>
                  </div>
                  {c.statusReason && <p className="email-campaign__reason"><FiAlertTriangle aria-hidden="true" /> {c.statusReason}</p>}
                  <div className="email-campaign__actions">
                    {c.status === 'PAUSED' && (
                      <button type="button" className="email-ghost-btn" onClick={() => campaignAction(() => api.admin.resumeEmailCampaign(c.id), 'تم استئناف الحملة.')}>
                        <FiPlay aria-hidden="true" /> استئناف
                      </button>
                    )}
                    {(c.status === 'SENDING' || c.status === 'PAUSED') && (
                      <button type="button" className="email-ghost-btn is-danger" onClick={() => campaignAction(() => api.admin.cancelEmailCampaign(c.id), 'تم إيقاف الحملة نهائياً.')}>
                        <FiPause aria-hidden="true" /> إيقاف نهائي
                      </button>
                    )}
                    {(c.failed > 0 || c.skipped > 0) && (
                      <button type="button" className="email-link-btn" onClick={() => showDetails(c)}>
                        {isOpen ? 'إخفاء التفاصيل' : 'عرض الرسائل التي لم تصل'}
                      </button>
                    )}
                  </div>
                  {isOpen && openCampaign.problems.length > 0 && (
                    <ul className="email-problems">
                      {openCampaign.problems.map((p) => (
                        <li key={p.id}>
                          <span dir="ltr">{p.email}</span>
                          <span className={p.status === 'FAILED' ? 'is-bad' : ''}>
                            {p.status === 'FAILED' ? 'فشل الإرسال' : PROBLEM_LABELS[p.error] || 'تم التخطي'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Preview */}
      {preview && (
        <div className="admin-modal-backdrop" onClick={() => setPreview(null)}>
          <div className="admin-modal-dialog email-preview" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="email-preview-title">
            <div className="modal-header">
              <h3 id="email-preview-title">معاينة الرسالة</h3>
              <button type="button" className="modal-close-btn" onClick={() => setPreview(null)} aria-label="إغلاق"><FiX /></button>
            </div>
            <p className="email-preview__subject"><span>العنوان:</span> {preview.subject}</p>
            <iframe title="معاينة الرسالة" className="email-preview__frame" srcDoc={preview.html} sandbox="" />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirm)}
        title="تأكيد إرسال الحملة"
        message={confirm
          ? `سيتم إرسال «${subject.trim()}» إلى ${confirm.count.toLocaleString('en-US')} عميل (${audienceLabel(confirm.audience)}). لا يمكن التراجع بعد بدء الإرسال، لكن يمكنك إيقافه. هل تريد المتابعة؟`
          : ''}
        confirmText="إرسال الحملة"
        cancelText="تراجع"
        type="success"
        isLoading={busy === 'send'}
        onConfirm={handleSend}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
