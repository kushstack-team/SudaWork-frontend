import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Messages.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
import { 
  FiSearch, 
  FiSend, 
  FiPaperclip, 
  FiCheck, 
  FiCheckCircle, 
  FiClock, 
  FiArrowRight, 
  FiMessageSquare, 
  FiShield, 
  FiFileText,
  FiX,
  FiUser
} from 'react-icons/fi';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const contractIdParam = searchParams.get('contractId');
  const userIdParam = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load all user conversations & threads
  const loadConversations = async () => {
    if (!user) return;
    try {
      const [allContracts, allUserMsgs, allUsers, allProjects] = await Promise.all([
        mockApi.contracts.getByUser(user.id),
        mockApi.messages.getByUser(user.id),
        mockApi.users.getAll(),
        mockApi.projects.getAll(),
      ]);

      const threadMap = {};

      // 1. Group by contracts
      for (const contract of allContracts) {
        const otherPartyId = user.role === 'client' ? contract.freelancerId : contract.clientId;
        const otherUser = allUsers.find((u) => u.id === otherPartyId);
        const proj = allProjects.find((p) => p.id === contract.projectId);

        let otherProf = null;
        if (user.role === 'client') {
          otherProf = await mockApi.profiles.getFreelancerProfile(otherPartyId);
        } else {
          otherProf = await mockApi.profiles.getClientProfile(otherPartyId);
        }

        const contractMsgs = allUserMsgs.filter((m) => m.contractId === contract.id);
        contractMsgs.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

        const lastMsg = contractMsgs.length > 0 ? contractMsgs[contractMsgs.length - 1] : null;
        const unreadCount = contractMsgs.filter((m) => m.receiverId === user.id && !m.readAt).length;

        threadMap[contract.id] = {
          id: contract.id,
          type: 'contract',
          contract,
          project: proj,
          counterpartyId: otherPartyId,
          counterpartyName: otherUser?.fullName || 'مستخدم سوداوورك',
          counterpartyAvatar: (user.role === 'client' ? otherProf?.photo : otherProf?.companyLogo) || defaultAvatar,
          counterpartySubtitle: user.role === 'client' ? otherProf?.title : otherProf?.companyName || 'حساب موثق',
          lastMessage: lastMsg,
          unreadCount,
          messages: contractMsgs,
          updatedAt: lastMsg ? new Date(lastMsg.sentAt) : new Date(contract.createdAt),
        };
      }

      // 2. Also check if there are direct messages not attached to a contract
      const nonContractMsgs = allUserMsgs.filter((m) => !m.contractId);
      for (const msg of nonContractMsgs) {
        const otherPartyId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        const threadKey = `user_${otherPartyId}`;
        if (!threadMap[threadKey]) {
          const otherUser = allUsers.find((u) => u.id === otherPartyId);
          threadMap[threadKey] = {
            id: threadKey,
            type: 'direct',
            counterpartyId: otherPartyId,
            counterpartyName: otherUser?.fullName || 'مستخدم سوداوورك',
            counterpartyAvatar: defaultAvatar,
            counterpartySubtitle: 'محادثة مباشرة',
            lastMessage: msg,
            unreadCount: msg.receiverId === user.id && !msg.readAt ? 1 : 0,
            messages: [msg],
            updatedAt: new Date(msg.sentAt),
          };
        } else {
          threadMap[threadKey].messages.push(msg);
          if (new Date(msg.sentAt) > threadMap[threadKey].updatedAt) {
            threadMap[threadKey].updatedAt = new Date(msg.sentAt);
            threadMap[threadKey].lastMessage = msg;
          }
          if (msg.receiverId === user.id && !msg.readAt) {
            threadMap[threadKey].unreadCount += 1;
          }
        }
      }

      // 3. Convert to array and sort by latest activity
      const threadList = Object.values(threadMap).sort((a, b) => b.updatedAt - a.updatedAt);
      setThreads(threadList);

      // 4. Select thread based on params or first item
      let selectedId = null;
      if (contractIdParam && threadMap[contractIdParam]) {
        selectedId = contractIdParam;
      } else if (userIdParam) {
        const found = threadList.find((t) => t.counterpartyId === userIdParam);
        if (found) selectedId = found.id;
      }

      if (!selectedId && threadList.length > 0) {
        selectedId = threadList[0].id;
      }

      setActiveThreadId(selectedId);
      if (selectedId && threadMap[selectedId]) {
        setMessages(threadMap[selectedId].messages);
        markThreadRead(threadMap[selectedId]);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user, contractIdParam, userIdParam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark thread read
  const markThreadRead = async (thread) => {
    if (!thread || !user) return;
    try {
      await mockApi.messages.markAsRead(
        thread.counterpartyId,
        user.id,
        thread.type === 'contract' ? thread.id : null
      );
      // Update local thread unread count
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Select a thread
  const handleSelectThread = (thread) => {
    setActiveThreadId(thread.id);
    setMessages(thread.messages);
    markThreadRead(thread);
    setMobileShowChat(true);
    if (thread.type === 'contract') {
      setSearchParams({ contractId: thread.id });
    } else {
      setSearchParams({ userId: thread.counterpartyId });
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = newMessageText.trim();
    if (!text && !attachmentName) return;

    const currentThread = threads.find((t) => t.id === activeThreadId);
    if (!currentThread || !user) return;

    const attachments = attachmentName
      ? [{ name: attachmentName, size: '1.2 MB', url: '#' }]
      : [];

    const msgPayload = {
      contractId: currentThread.type === 'contract' ? currentThread.contract.id : null,
      senderId: user.id,
      receiverId: currentThread.counterpartyId,
      body: text,
      attachments,
    };

    try {
      const sentMsg = await mockApi.messages.send(msgPayload);
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessageText('');
      setAttachmentName('');
      setIsAttaching(false);

      // Update thread lastMessage
      setThreads((prev) =>
        prev.map((t) =>
          t.id === currentThread.id
            ? {
                ...t,
                lastMessage: sentMsg,
                updatedAt: new Date(sentMsg.sentAt),
                messages: [...t.messages, sentMsg],
              }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Filter threads by search query
  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.counterpartyName.toLowerCase().includes(q) ||
      (t.project?.title && t.project.title.toLowerCase().includes(q))
    );
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
                ) : filteredThreads.length === 0 ? (
                  <div className="no-threads-box">
                    <FiMessageSquare className="empty-threads-icon" />
                    <p>لا توجد محادثات نشطة</p>
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
                            src={thread.counterpartyAvatar}
                            alt={thread.counterpartyName}
                            className="thread-avatar-img"
                          />
                          <span className="thread-online-dot" />
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

                          {thread.project && (
                            <p className="thread-project-tag">
                              {thread.project.title}
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
                        src={activeThread.counterpartyAvatar}
                        alt={activeThread.counterpartyName}
                        className="chat-header-avatar"
                      />
                      <div>
                        <h3 className="chat-header-name">{activeThread.counterpartyName}</h3>
                        <p className="chat-header-sub">
                          {activeThread.counterpartySubtitle} • <span className="online-text">متصل الآن</span>
                        </p>
                      </div>
                    </div>

                    {/* Contract Link if associated */}
                    {activeThread.contract && (
                      <div className="chat-contract-pill">
                        <FiShield className="contract-icon" />
                        <Link to={`/contracts/${activeThread.contract.id}`} className="contract-link">
                          <span>عقد رقم #{activeThread.contract.id}</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Messages Feed */}
                  <div className="messages-feed">
                    {messages.length === 0 ? (
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
                              <p className="message-text">{msg.body}</p>

                              {/* Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="bubble-attachments">
                                  {msg.attachments.map((att, idx) => (
                                    <div key={idx} className="msg-attachment-chip">
                                      <FiPaperclip />
                                      <span>{att.name}</span>
                                    </div>
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
                                  <FiCheck className={`read-check ${msg.readAt ? 'read' : ''}`} />
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
                      <FiPaperclip className="prompt-icon" />
                      <input
                        type="text"
                        placeholder="اسم الملف المرفق (مثال: Project_Brief.pdf)..."
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        className="attach-input"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="cancel-attach-btn"
                        onClick={() => {
                          setIsAttaching(false);
                          setAttachmentName('');
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
                      disabled={!newMessageText.trim() && !attachmentName}
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
