import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultConversations, defaultMessages, defaultUsers, defaultFreelancerProfiles, defaultClientProfiles } from './seedData.js';

export const messagesApi = {
  async getByUser(userId) {
    await delay();
    const msgs = getStorageItem('messages', defaultMessages);
    return msgs.filter((m) => m.senderId === userId || m.receiverId === userId || m.readBy?.includes(userId));
  },

  async getConversations(userId) {
    await delay();
    const convs = getStorageItem('conversations', defaultConversations);
    const msgs = getStorageItem('messages', defaultMessages);
    const users = getStorageItem('users', defaultUsers);
    const flProfs = getStorageItem('freelancerProfiles', defaultFreelancerProfiles);
    const clProfs = getStorageItem('clientProfiles', defaultClientProfiles);

    const userConvs = convs.filter((c) => c.participants.includes(userId));

    return userConvs.map((c) => {
      const otherId = c.participants.find((p) => p !== userId);
      const otherUser = users.find((u) => u.id === otherId);
      const otherFl = flProfs.find((p) => p.userId === otherId);
      const otherCl = clProfs.find((p) => p.userId === otherId);

      const convMsgs = msgs.filter((m) => m.conversationId === c.id || (m.senderId === otherId && m.receiverId === userId) || (m.senderId === userId && m.receiverId === otherId));
      const lastMsg = convMsgs[convMsgs.length - 1] || null;
      const unreadCount = convMsgs.filter(
        (m) => m.senderId !== userId && !m.readAt && !m.readBy?.includes(userId)
      ).length;

      return {
        ...c,
        otherUser: {
          id: otherId,
          fullName: otherUser?.fullName || 'مستخدم',
          avatar: otherFl?.photo || otherCl?.logo || '',
          role: otherUser?.role,
        },
        lastMessage: lastMsg ? (lastMsg.body || lastMsg.text) : '',
        lastMessageTime: lastMsg ? (lastMsg.sentAt || lastMsg.createdAt) : c.updatedAt,
        unreadCount,
      };
    });
  },

  async getMessages(conversationId) {
    await delay();
    const msgs = getStorageItem('messages', defaultMessages);
    return msgs.filter((m) => m.conversationId === conversationId);
  },

  async send(data) {
    await delay(80);
    const msgs = getStorageItem('messages', defaultMessages);
    const now = new Date().toISOString();

    const newMsg = {
      id: `msg_${Date.now()}`,
      contractId: data.contractId || null,
      conversationId: data.conversationId || (data.contractId ? `conv_${data.contractId}` : null),
      senderId: data.senderId,
      receiverId: data.receiverId,
      body: data.body || data.text || '',
      text: data.body || data.text || '',
      attachments: data.attachments || [],
      sentAt: now,
      createdAt: now,
      readAt: null,
      readBy: [data.senderId],
    };

    msgs.push(newMsg);
    setStorageItem('messages', msgs);
    return newMsg;
  },

  async sendMessage(data) {
    return this.send(data);
  },

  async markAsRead(param1, userId, contractId) {
    const msgs = getStorageItem('messages', defaultMessages);
    let changed = false;

    msgs.forEach((m) => {
      const matchesContract = contractId && m.contractId === contractId;
      const matchesCounterparty = (m.senderId === param1 && m.receiverId === userId);
      const matchesConv = m.conversationId === param1;

      if ((matchesContract || matchesCounterparty || matchesConv) && m.receiverId === userId) {
        if (!m.readAt) {
          m.readAt = new Date().toISOString();
          changed = true;
        }
        if (!m.readBy) m.readBy = [];
        if (!m.readBy.includes(userId)) {
          m.readBy.push(userId);
          changed = true;
        }
      }
    });

    if (changed) {
      setStorageItem('messages', msgs);
    }
    return true;
  },

  async getUnreadCount(userId) {
    await delay(30);
    const msgs = getStorageItem('messages', defaultMessages);
    return msgs.filter(
      (m) => (m.receiverId === userId || (!m.receiverId && m.senderId !== userId)) && !m.readAt && (!m.readBy || !m.readBy.includes(userId))
    ).length;
  },
};
