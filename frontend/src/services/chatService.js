import api from './api';

const chatService = {
  // Get all conversations for the logged in user
  getInbox: async () => {
    const { data } = await api.get('/chats');
    return data.conversations;
  },

  // Get message history between two users
  getMessages: async (userId, listingId = null) => {
    const params = {};
    if (listingId) params.listingId = listingId;
    
    const { data } = await api.get(`/chats/${userId}`, { params });
    return data.messages;
  },

  // Send a new message
  sendMessage: async (receiverId, content, listingId = null, type = 'text') => {
    const { data } = await api.post('/chats', {
      receiverId,
      content,
      listingId,
      type
    });
    return data.message;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const { data } = await api.get('/chats/unread/count');
    return data.count;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const { data } = await api.delete(`/chats/${messageId}`);
    return data;
  },

  // Clear entire conversation
  clearConversation: async (userId, listingId = null) => {
    const params = {};
    if (listingId) params.listingId = listingId;
    
    const { data } = await api.delete(`/chats/conversation/${userId}`, { params });
    return data;
  }
};

export default chatService;
