import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMessageSquare,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiUser,
} from 'react-icons/fi';
import { api } from '../../../services/api';
import defaultAvatar from '../../../assets/default-avatar.svg';
import FilePicker from '../../../components/FilePicker/FilePicker';
import WithdrawalNoticeCard from '../../../components/WithdrawalNotice/WithdrawalNoticeCard';
import './AdminChat.css';

const LIST_POLL_MS = 15000;
const CHAT_POLL_MS = 6000;

const mergeMessages = (current, incoming) => {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
};

const timeLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
};

const ROLE_LABELS = { freelancer: 'مستقل', client: 'صاحب عمل' };

const snippet = (thread) => {
  const last = thread.lastMessage;
  if (!last) return 'محادثة جديدة';
  if (last.kind === 'withdrawal_proof') return 'إشعار تحويل أرباح';
  return last.body || 'مرفق ملف';
};

/**
 * Admin inbox for support conversations with clients and freelancers
 * (payout notices and their answers live here). Separate from /messages:
 * every admin sees and answers the same conversations.
 */
export default function AdminChatTab({ onUnreadChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('conversationId');

  const [threads, setThreads] = useState([]);
  const [listState, setListState] = useState('loading'); // loading | ready | error
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState('idle'); // idle | loading | ready | error
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState([]);
  const [showAttach, setShowAttach] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const feedRef = useRef(null);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadThreads = useCallback(async () => {
    try {
      const list = await api.admin.supportConversations();
      setThreads(list);
      setListState('ready');
      onUnreadChange?.(list.reduce((sum, t) => sum + t.unreadCount, 0));
    } catch {
      setListState((s) => (s === 'ready' ? s : 'error'));
    }
  }, [onUnreadChange]);

  const markRead = useCallback(async (id) => {
    try {
      await api.messages.markRead(id);
      setThreads((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t));
        onUnreadChange?.(next.reduce((sum, t) => sum + t.unreadCount, 0));
        return next;
      });
    } catch { /* best effort */ }
  }, [onUnreadChange]);

  // Conversation list + polling.
  useEffect(() => {
    const first = setTimeout(loadThreads, 0);
    const timer = setInterval(() => !document.hidden && loadThreads(), LIST_POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [loadThreads]);

  // Selected conversation + polling.
  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;
    const load = async (initial) => {
      if (initial) {
        setChatState('loading');
        setMessages([]);
      }
      try {
        const page = await api.messages.messages(activeId, { limit: 60 });
        if (cancelled || activeIdRef.current !== activeId) return;
        setMessages((prev) => {
          const merged = initial ? page.messages : mergeMessages(prev, page.messages);
          if (initial || merged.length !== prev.length) markRead(activeId);
          return merged;
        });
        setChatState('ready');
      } catch {
        if (!cancelled && initial) setChatState('error');
      }
    };
    const first = setTimeout(() => load(true), 0);
    const timer = setInterval(() => !document.hidden && load(false), CHAT_POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [activeId, markRead]);

  // Keep the newest message in view.
  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [lastId, activeId]);

  const selectThread = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('conversationId', id);
    else next.delete('conversationId');
    setSearchParams(next, { replace: !id });
    setDraft('');
    setFiles([]);
    setShowAttach(false);
    setSendError('');
  };

  const readyFiles = files.filter((f) => f.status === 'done' && f.upload);
  const uploading = files.some((f) => f.status === 'uploading');
  const canSend = !sending && !uploading && (draft.trim() || readyFiles.length > 0);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend || !activeId) return;
    setSending(true);
    setSendError('');
    try {
      const sent = await api.messages.send(activeId, {
        message: draft.trim(),
        attachmentIds: readyFiles.map((f) => f.upload.id),
      });
      setMessages((prev) => mergeMessages(prev, [sent]));
      setDraft('');
      setFiles([]);
      setShowAttach(false);
      loadThreads();
    } catch (err) {
      setSendError(err.message || 'تعذر إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const q = search.trim().toLowerCase();
  const visibleThreads = q
    ? threads.filter((t) => t.counterpartyName.toLowerCase().includes(q) || t.counterpartyEmail.toLowerCase().includes(q))
    : threads;
  const active = threads.find((t) => t.id === activeId);
  const profilePath = active
    ? active.counterpartyRole === 'freelancer' ? `/freelancers/${active.counterpartyId}` : `/clients/${active.counterpartyId}`
    : null;

  return (
    <div className="admin-tab-content">
      <div className={`admin-chat ${activeId ? 'has-active' : ''}`}>
        {/* Conversation list */}
        <aside className="admin-chat__list" aria-label="المحادثات">
          <div className="admin-chat__list-head">
            <h3>محادثات الدعم</h3>
            <p>محادثاتك مع المستخدمين، ومنها إشعارات تحويل الأرباح.</p>
            <label className="admin-chat__search">
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو البريد الإلكتروني"
                aria-label="ابحث في المحادثات"
              />
            </label>
          </div>

          <div className="admin-chat__threads">
            {listState === 'loading' && (
              <div className="admin-chat__empty"><span className="admin-chat__spinner" aria-hidden="true" /> جارٍ التحميل...</div>
            )}
            {listState === 'error' && (
              <div className="admin-chat__empty">
                <p>تعذر تحميل المحادثات.</p>
                <button type="button" className="admin-chat__retry" onClick={loadThreads}>
                  <FiRefreshCw aria-hidden="true" /> إعادة المحاولة
                </button>
              </div>
            )}
            {listState === 'ready' && visibleThreads.length === 0 && (
              <div className="admin-chat__empty">
                <FiMessageSquare className="admin-chat__empty-icon" aria-hidden="true" />
                <p>{q ? 'لا توجد محادثات مطابقة.' : 'لا توجد محادثات بعد.'}</p>
                {!q && <small>تبدأ المحادثة تلقائياً عند تحويل أرباح مستقل، أو من زر «مراسلة» في صفحة المستخدمين.</small>}
              </div>
            )}
            {visibleThreads.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`admin-chat__thread ${t.id === activeId ? 'is-active' : ''} ${t.unreadCount > 0 ? 'is-unread' : ''}`}
                onClick={() => selectThread(t.id)}
              >
                <img src={t.counterpartyAvatar || defaultAvatar} alt="" className="admin-chat__avatar" />
                <span className="admin-chat__thread-body">
                  <span className="admin-chat__thread-top">
                    <span className="admin-chat__name">{t.counterpartyName}</span>
                    <span className="admin-chat__time">{timeLabel(t.lastMessage?.sentAt || t.updatedAt)}</span>
                  </span>
                  <span className="admin-chat__thread-bottom">
                    <span className="admin-chat__snippet">{snippet(t)}</span>
                    {t.unreadCount > 0 && <span className="admin-chat__badge">{t.unreadCount}</span>}
                  </span>
                  <span className={`admin-chat__role is-${t.counterpartyRole}`}>{ROLE_LABELS[t.counterpartyRole] || ''}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation */}
        <section className="admin-chat__pane" aria-label="المحادثة">
          {!activeId ? (
            <div className="admin-chat__placeholder">
              <FiMessageSquare aria-hidden="true" />
              <p>اختر محادثة من القائمة لعرضها.</p>
            </div>
          ) : (
            <>
              <header className="admin-chat__head">
                <button type="button" className="admin-chat__back" onClick={() => selectThread(null)} aria-label="العودة إلى المحادثات">
                  <FiArrowRight />
                </button>
                <img src={active?.counterpartyAvatar || defaultAvatar} alt="" className="admin-chat__avatar" />
                <div className="admin-chat__head-text">
                  <strong>{active?.counterpartyName || 'محادثة'}</strong>
                  <span>{[ROLE_LABELS[active?.counterpartyRole], active?.counterpartyEmail].filter(Boolean).join(' · ')}</span>
                </div>
                {profilePath && active?.counterpartyId && (
                  <Link to={profilePath} className="admin-chat__profile" target="_blank" rel="noopener noreferrer">
                    <FiUser aria-hidden="true" />
                    <span>الملف الشخصي</span>
                  </Link>
                )}
              </header>

              <div className="admin-chat__feed" ref={feedRef}>
                {chatState === 'loading' && (
                  <div className="admin-chat__empty"><span className="admin-chat__spinner" aria-hidden="true" /> جارٍ تحميل الرسائل...</div>
                )}
                {chatState === 'error' && <div className="admin-chat__empty"><p>تعذر تحميل الرسائل.</p></div>}
                {chatState === 'ready' && messages.length === 0 && (
                  <div className="admin-chat__empty"><p>لا توجد رسائل بعد. اكتب أول رسالة.</p></div>
                )}
                {messages.map((m) => {
                  // The user is participant 1; anything else was sent by an admin.
                  const fromAdmin = active ? m.senderId !== active.counterpartyId : true;
                  const receiptOk = m.kind === 'withdrawal_receipt' && m.body.startsWith('تم استلام');
                  return (
                    <div key={m.id} className={`admin-chat__row ${fromAdmin ? 'is-admin' : 'is-user'}`}>
                      <div
                        className={[
                          'admin-chat__bubble',
                          m.kind === 'withdrawal_proof' ? 'is-notice' : '',
                          m.kind === 'withdrawal_receipt' ? (receiptOk ? 'is-receipt ok' : 'is-receipt warn') : '',
                        ].join(' ')}
                      >
                        {m.kind === 'withdrawal_proof' ? (
                          <WithdrawalNoticeCard message={m} />
                        ) : m.kind === 'withdrawal_receipt' ? (
                          <p className="admin-chat__text admin-chat__receipt">
                            {receiptOk ? <FiCheckCircle aria-hidden="true" /> : <FiAlertTriangle aria-hidden="true" />}
                            <span>{m.body}</span>
                          </p>
                        ) : (
                          m.body && <p className="admin-chat__text">{m.body}</p>
                        )}
                        {m.kind !== 'withdrawal_proof' && m.attachments?.length > 0 && (
                          <div className="admin-chat__files">
                            {m.attachments.map((f) => (
                              <button type="button" key={f.id} className="admin-chat__file" onClick={() => api.uploads.open(f).catch(() => {})}>
                                <FiPaperclip aria-hidden="true" />
                                <span>{f.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="admin-chat__meta">
                          {fromAdmin ? 'الإدارة · ' : ''}{timeLabel(m.sentAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="admin-chat__composer" onSubmit={handleSend}>
                {showAttach && (
                  <div className="admin-chat__attach">
                    <FilePicker
                      id="admin-chat-files"
                      purpose="message"
                      multiple
                      maxFiles={5}
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.zip"
                      files={files}
                      onChange={setFiles}
                      disabled={sending}
                    />
                  </div>
                )}
                {sendError && <p className="admin-chat__error" role="alert">{sendError}</p>}
                <div className="admin-chat__compose-row">
                  <button
                    type="button"
                    className={`admin-chat__icon-btn ${showAttach ? 'is-on' : ''}`}
                    onClick={() => setShowAttach((v) => !v)}
                    aria-label="إرفاق ملف"
                    title="إرفاق ملف"
                  >
                    <FiPaperclip />
                  </button>
                  <textarea
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
                    }}
                    placeholder="اكتب رسالتك..."
                    aria-label="نص الرسالة"
                    maxLength={5000}
                    disabled={sending}
                  />
                  <button type="submit" className="admin-chat__send" disabled={!canSend} aria-label="إرسال">
                    {sending ? <span className="admin-chat__spinner is-light" aria-hidden="true" /> : <FiSend />}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
