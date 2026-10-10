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
  FiX
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

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
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const activeIdRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          const created = await api.messages.start({ participantId: userIdParam });
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

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = newMessageText.trim();
    if ((!text && readyAttachments.length === 0) || !activeThreadId || sending || uploading) return;

    setSending(true);
    setChatError('');
    try {
      const sentMsg = await api.messages.send(activeThreadId, {
        message: text,
        attachmentIds: readyAttachments.map((a) => a.upload.id),
      });
      setMessages((prev) => mergeMessages(prev, [sentMsg]));
      setNewMessageText('');
      setAttachments([]);
      setIsAttaching(false);
      setThreads((prev) =>
        prev
          .map((t) => (t.id === activeThreadId ? { ...t, lastMessage: sentMsg, updatedAt: sentMsg.sentAt } : t))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    } catch (err) {
      // The typed text is kept so nothing is lost.
      setChatError(err.message);
    } finally {
      setSending(false);
    }
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
                  <div className="threads-loading">
                    <div className="profile-spinner" />
                    <span>جارٍ تحميل المحادثات...</span>
                  </div>
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

                    <div className="chat-counterparty-info">
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
                    </div>

                    {/* Contract Link if associated */}
                    {activeThread.contractId && (
                      <div className="chat-contract-pill">
                        <FiShield className="contract-icon" />
                        <Link to={`/contracts/${activeThread.contractId}`} className="contract-link">
                          <span>عرض العقد</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Messages Feed */}
                  <div className="messages-feed">
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
                            className={`message-row ${isMine ? 'outgoing' : 'incoming'}`}
                          >
                            <div className="message-bubble">
                              {msg.body && <p className="message-text">{msg.body}</p>}

                              {/* Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="bubble-attachments">
                                  {msg.attachments.map((att) => (
                                    <button key={att.id} type="button" className="msg-attachment-chip" onClick={() => openAttachment(att)}>
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
                                {isMine && (
                                  <FiCheck className={`read-check ${msg.isRead ? 'read' : ''}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
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
                          disabled={sending}
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
                      placeholder="اكتب رسالتك هنا واضغط Enter..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="send-message-btn"
                      disabled={sending || uploading || (!newMessageText.trim() && readyAttachments.length === 0)}
                      aria-label="إرسال"
                    >
                      <FiSend className="send-icon" />
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
