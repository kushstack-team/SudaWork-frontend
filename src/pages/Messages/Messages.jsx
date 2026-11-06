import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Messages.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import defaultAvatar from '../../assets/default-avatar.svg';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import FilePicker from '../../components/FilePicker/FilePicker';
import {
  FiSearch,
  FiSend,
  FiPaperclip,
  FiCheck,
  FiArrowRight,
  FiMessageSquare,
  FiShield,
  FiX,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';
import { RowListSkeleton } from '../../components/common/Skeleton/Skeleton';

const THREAD_POLL_MS = 20000;
const CHAT_POLL_MS = 8000;

// Appends messages by id so polling and optimistic sends never duplicate.
const mergeMessages = (current, incoming) => {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
};

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const contractIdParam = searchParams.get('contractId');
  const userIdParam = searchParams.get('userId');
  const conversationIdParam = searchParams.get('conversationId');
  // Set when a client messages a bidder from a project page (pre-hire chat).
  const projectIdParam = searchParams.get('projectId');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [chatError, setChatError] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isAttaching, setIsAttaching] = useState(false);
  // Number of messages on their way to the server (shown as "sending" bubbles).
  const [sendingCount, setSendingCount] = useState(0);
  const sending = sendingCount > 0;
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const feedRef = useRef(null);
  const activeIdRef = useRef(null);
  const scrolledThreadRef = useRef(null);
  const pendingSeqRef = useRef(0);

  const markThreadRead = async (threadId) => {
    try {
      await api.messages.markRead(threadId);
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)));
    } catch {
      // Read receipts are best-effort; the unread badge refreshes on the next poll.
    }
  };

  const openThread = async (threadId) => {
    activeIdRef.current = threadId;
    setActiveThreadId(threadId);
    setChatError('');
    setMessages([]);
    try {
      const page = await api.messages.messages(threadId);
      if (activeIdRef.current !== threadId) return;
      setMessages(page.messages);
      setHasMore(page.hasMore);
      markThreadRead(threadId);
    } catch (err) {
      setChatError(err.message);
    }
  };

  // Loads conversations and resolves deep links (?contractId, ?userId, ?conversationId).
  const loadConversations = async () => {
    try {
      let list = await api.messages.conversations();
      let selected = null;
      if (conversationIdParam) selected = list.find((t) => t.id === conversationIdParam);
      if (!selected && contractIdParam) selected = list.find((t) => t.contractId === contractIdParam);
      if (!selected && userIdParam && userIdParam !== user?.id) {
        selected = list.find((t) => t.counterpartyId === userIdParam);
        if (!selected) {
          // Starting a new conversation from a profile page.
          const created = await api.messages.start({ participantId: userIdParam, projectId: projectIdParam || undefined });
          list = await api.messages.conversations();
          selected = list.find((t) => t.id === created.id);
        }
      }
      setThreads(list);
      setLoadError(null);
      const target = selected || list[0];
      if (target && target.id !== activeIdRef.current) {
        if (selected) setMobileShowChat(true);
        openThread(target.id);
      }
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadConversations, [user?.id, contractIdParam, userIdParam, conversationIdParam], Boolean(user));

  // Polling keeps the inbox and the open chat current (no websocket server).
  useEffect(() => {
    if (!user) return undefined;
    const threadTimer = setInterval(async () => {
      try {
        setThreads(await api.messages.conversations());
      } catch { /* keep the last good list */ }
    }, THREAD_POLL_MS);
    const chatTimer = setInterval(async () => {
      const id = activeIdRef.current;
      if (!id || document.hidden) return;
      try {
        const page = await api.messages.messages(id, { limit: 30 });
        if (activeIdRef.current !== id) return;
        setMessages((prev) => {
          const merged = mergeMessages(prev, page.messages);
          if (merged.length !== prev.length) markThreadRead(id);
          return merged;
        });
      } catch { /* retried on the next tick */ }
    }, CHAT_POLL_MS);
    return () => {
      clearInterval(threadTimer);
      clearInterval(chatTimer);
    };
  }, [user]);

  // Keep the newest message in view. Only the message list scrolls (never the
  // page), and loading older messages above doesn't jump back to the bottom.
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed || !lastMessageId) return;
    const firstInThread = scrolledThreadRef.current !== activeThreadId;
    scrolledThreadRef.current = activeThreadId;
    feed.scrollTo({ top: feed.scrollHeight, behavior: firstInThread ? 'auto' : 'smooth' });
  }, [lastMessageId, activeThreadId]);

  const loadOlder = async () => {
    if (!activeThreadId || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const page = await api.messages.messages(activeThreadId, { before: messages[0].sentAt });
      setMessages((prev) => mergeMessages(page.messages, prev));
      setHasMore(page.hasMore);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSelectThread = (thread) => {
    setMobileShowChat(true);
    if (thread.id !== activeThreadId) openThread(thread.id);
    setSearchParams(thread.contractId ? { contractId: thread.contractId } : { conversationId: thread.id });
  };

  const readyAttachments = attachments.filter((a) => a.upload);
  const uploading = attachments.some((a) => a.status === 'uploading');

  // Sends one message. It shows at once as a "sending" bubble, is replaced by
  // the saved message on success, and stays as "failed" (with retry) otherwise.
  const deliver = async (threadId, pending) => {
    setSendingCount((n) => n + 1);
    try {
      const sentMsg = await api.messages.send(threadId, {
        message: pending.body,
        attachmentIds: pending.attachmentIds,
      });
      if (activeIdRef.current === threadId) {
        setMessages((prev) => mergeMessages(prev.filter((m) => m.id !== pending.id), [sentMsg]));
      }
      setThreads((prev) =>
        prev
          .map((t) => (t.id === threadId ? { ...t, lastMessage: sentMsg, updatedAt: sentMsg.sentAt } : t))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    } catch {
      if (activeIdRef.current === threadId) {
        setMessages((prev) => prev.map((m) => (m.id === pending.id ? { ...m, status: 'failed' } : m)));
      }
    } finally {
      setSendingCount((n) => n - 1);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = newMessageText.trim();
    if ((!text && readyAttachments.length === 0) || !activeThreadId || uploading) return;

    const pending = {
      id: `pending-${(pendingSeqRef.current += 1)}`,
      senderId: user?.id,
      body: text,
      attachments: readyAttachments.map((a) => ({ id: a.upload.id, name: a.upload.name || a.file?.name || 'ملف' })),
      attachmentIds: readyAttachments.map((a) => a.upload.id),
      sentAt: new Date().toISOString(),
      status: 'sending',
    };
    setChatError('');
    setMessages((prev) => [...prev, pending]);
    setNewMessageText('');
    setAttachments([]);
    setIsAttaching(false);
    deliver(activeThreadId, pending);
  };

  const retryMessage = (msg) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: 'sending' } : m)));
    deliver(activeThreadId, { ...msg, status: 'sending' });
  };

  const discardMessage = (msg) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
  };

  const openAttachment = async (file) => {
    try {
      await api.uploads.open(file);
    } catch (err) {
      setChatError(err.message);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.counterpartyName.toLowerCase().includes(q) || t.projectTitle.toLowerCase().includes(q);
  });

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="messages-page" dir="rtl">
      <DashboardNavbar />

      <main className="messages-main">
        <div className="messages-container">

          {/* Messaging Window Card */}
          <div className="messages-window-card">
            
            {/* Sidebar: Conversations List */}
            <aside className={`conversations-sidebar ${mobileShowChat ? 'hide-mobile' : ''}`}>
              <div className="sidebar-header">
                <h2 className="sidebar-title">المحادثات</h2>
                <span className="threads-count-tag">{threads.length} محادثة</span>
              </div>

              {/* Search Bar */}
              <div className="threads-search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو اسم المشروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="threads-search-input"
                />
              </div>

              {/* Threads List */}
              <div className="threads-list">
                {loading ? (
                  <RowListSkeleton label="جارٍ تحميل المحادثات..." count={6} variant="thread" />
                ) : loadError ? (
                  <ErrorState title="تعذر تحميل المحادثات" error={loadError} onRetry={() => { setLoading(true); loadConversations(); }} />
                ) : threads.length === 0 ? (
                  <div className="no-threads-box">
                    <FiMessageSquare className="empty-threads-icon" />
                    <p><strong>لا توجد محادثات بعد</strong></p>
                    <p>ستظهر هنا محادثاتك مع العملاء أو المستقلين عند بدء التواصل، وتُفتح محادثة تلقائياً عند إنشاء أي عقد.</p>
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="no-threads-box">
                    <FiSearch className="empty-threads-icon" />
                    <p>لا توجد محادثات مطابقة للبحث</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    const isSelected = thread.id === activeThreadId;
                    return (
                      <div
                        key={thread.id}
                        className={`thread-item ${isSelected ? 'active' : ''} ${thread.unreadCount > 0 ? 'unread' : ''}`}
                        onClick={() => handleSelectThread(thread)}
                      >
                        <div className="thread-avatar-box">
                          <img
                            src={thread.counterpartyAvatar || defaultAvatar}
                            alt={thread.counterpartyName}
                            className="thread-avatar-img"
                          />
                        </div>

                        <div className="thread-content-box">
                          <div className="thread-title-row">
                            <h4 className="thread-name">{thread.counterpartyName}</h4>
                            <span className="thread-time">
                              {thread.lastMessage
                                ? new Date(thread.lastMessage.sentAt).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>

                          {thread.projectTitle && (
                            <p className="thread-project-tag">
                              {thread.projectTitle}
                            </p>
                          )}

                          <div className="thread-snippet-row">
                            <p className="thread-last-snippet">
                              {thread.lastMessage
                                ? thread.lastMessage.body || 'مرفق ملف'
                                : 'محادثة جديدة'}
                            </p>
                            {thread.unreadCount > 0 && (
                              <span className="unread-badge">{thread.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Chat Pane */}
            <section className={`chat-pane ${!mobileShowChat ? 'hide-mobile' : ''}`}>
              {activeThread ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <button
                      type="button"
                      className="mobile-back-btn"
                      onClick={() => setMobileShowChat(false)}
                      aria-label="العودة للمحادثات"
                    >
                      <FiArrowRight />
                    </button>

                    {(() => {
                      const profilePath = activeThread.counterpartyRole === 'freelancer'
                        ? `/freelancers/${activeThread.counterpartyId}`
                        : activeThread.counterpartyRole === 'client'
                          ? `/clients/${activeThread.counterpartyId}`
                          : null;
                      const identity = (
                        <>
                          <img
                            src={activeThread.counterpartyAvatar || defaultAvatar}
                            alt={activeThread.counterpartyName}
                            className="chat-header-avatar"
                          />
                          <div>
                            <h3 className="chat-header-name">{activeThread.counterpartyName}</h3>
                            <p className="chat-header-sub">
                              {activeThread.counterpartySubtitle || (activeThread.counterpartyRole === 'client' ? 'صاحب عمل' : 'مستقل')}
                            </p>
                          </div>
                        </>
                      );
                      return profilePath ? (
                        <Link to={profilePath} className="chat-counterparty-info is-link" title="عرض الملف الشخصي">
                          {identity}
                        </Link>
                      ) : (
                        <div className="chat-counterparty-info">{identity}</div>
                      );
                    })()}

                    {/* Contract button if associated */}
                    {activeThread.contractId && (
                      <Link to={`/contracts/${activeThread.contractId}`} className="chat-contract-pill">
                        <FiShield className="contract-icon" />
                        <span>عرض العقد</span>
                        <FiChevronLeft className="contract-arrow" />
                      </Link>
                    )}
                  </div>

                  {/* Messages Feed */}
                  <div className="messages-feed" ref={feedRef}>
                    {chatError && (
                      <div className="empty-feed-state" role="alert">
                        <p>{chatError}</p>
                      </div>
                    )}
                    {hasMore && (
                      <div className="empty-feed-state">
                        <button type="button" className="cancel-attach-btn" onClick={loadOlder} disabled={loadingOlder}>
                          {loadingOlder ? 'جارٍ التحميل...' : 'عرض الرسائل الأقدم'}
                        </button>
                      </div>
                    )}
                    {messages.length === 0 && !chatError ? (
                      <div className="empty-feed-state">
                        <FiMessageSquare className="empty-feed-icon" />
                        <h4>ابدأ محادثتك الآن</h4>
                        <p>تواصل باحترافية لمناقشة تفاصيل المشروع والتسليمات.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`message-row ${isMine ? 'outgoing' : 'incoming'} ${msg.status ? `is-${msg.status}` : ''}`}
                          >
                            <div className="message-bubble">
                              {msg.body && <p className="message-text">{msg.body}</p>}

                              {/* Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="bubble-attachments">
                                  {msg.attachments.map((att) => (
                                    <button key={att.id} type="button" className="msg-attachment-chip" onClick={() => !msg.status && openAttachment(att)}>
                                      <FiPaperclip />
                                      <span>{att.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              <div className="message-meta-row">
                                <span className="message-timestamp">
                                  {new Date(msg.sentAt).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isMine && msg.status === 'sending' && (
                                  <span className="message-status sending" role="status">
                                    <FiClock className="message-status-icon" aria-hidden="true" />
                                    جارٍ الإرسال...
                                  </span>
                                )}
                                {isMine && msg.status === 'failed' && (
                                  <span className="message-status failed" role="alert">
                                    <FiAlertCircle className="message-status-icon" aria-hidden="true" />
                                    لم تُرسل
                                  </span>
                                )}
                                {isMine && !msg.status && (
                                  <FiCheck className={`read-check ${msg.isRead ? 'read' : ''}`} />
                                )}
                              </div>
                              {msg.status === 'failed' && (
                                <div className="message-retry-row">
                                  <button type="button" onClick={() => retryMessage(msg)}>
                                    <FiRefreshCw aria-hidden="true" /> إعادة المحاولة
                                  </button>
                                  <button type="button" onClick={() => discardMessage(msg)}>حذف</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Attachment Bar if active */}
                  {isAttaching && (
                    <div className="attachment-prompt-bar">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FilePicker
                          id="message-attachment"
                          purpose="message"
                          multiple
                          maxFiles={5}
                          files={attachments}
                          onChange={setAttachments}
                        />
                      </div>
                      <button
                        type="button"
                        className="cancel-attach-btn"
                        onClick={() => {
                          setIsAttaching(false);
                          setAttachments([]);
                        }}
                      >
                        <FiX />
                      </button>
                    </div>
                  )}

                  {/* Message Input Strip */}
                  <form className="chat-input-bar" onSubmit={handleSendMessage}>
                    <button
                      type="button"
                      className={`attach-toggle-btn ${isAttaching ? 'active' : ''}`}
                      onClick={() => setIsAttaching((prev) => !prev)}
                      title="إرفاق ملف"
                    >
                      <FiPaperclip />
                    </button>

                    <input
                      type="text"
                      className="chat-text-input"
                      placeholder="اكتب رسالتك هنا..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                    />

                    <button
                      type="submit"
                      className={`send-message-btn ${sending ? 'is-sending' : ''}`}
                      disabled={uploading || (!newMessageText.trim() && readyAttachments.length === 0)}
                      aria-label={sending ? 'جارٍ الإرسال' : 'إرسال'}
                      aria-busy={sending}
                    >
                      {sending ? <span className="send-spinner" aria-hidden="true" /> : <FiSend className="send-icon" />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="no-chat-selected">
                  <FiMessageSquare className="huge-icon" />
                  <h3>اختر محادثة لعرض الرسائل</h3>
                  <p>يمكنك التنسيق مع المستقلين والعملاء ومتابعة تفاصيل المشاريع هنا.</p>
                </div>
              )}
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
