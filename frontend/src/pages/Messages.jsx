import React, { useState, useEffect, useContext } from 'react';
import { Send, User as UserIcon, MessageSquare, ShieldCheck, ChevronLeft, Trash2, MoreHorizontal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chatService';
import styles from './Messages.module.css';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [inboxLoading, setInboxLoading] = useState(true);

  // Fetch Inbox
  const fetchInbox = async () => {
    try {
      const data = await chatService.getInbox();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch inbox', error);
    } finally {
      setInboxLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 10000); // Poll inbox every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch Messages for active chat
  const fetchMessages = async (userId, listingId) => {
    try {
      const data = await chatService.getMessages(userId, listingId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.partner._id, activeChat.listing?._id);
      
      const interval = setInterval(() => {
        fetchMessages(activeChat.partner._id, activeChat.listing?._id);
      }, 5000); // Poll messages every 5s for active chat
      
      return () => clearInterval(interval);
    }
  }, [activeChat]);



  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const sentMsg = await chatService.sendMessage(
        activeChat.partner._id,
        newMessage,
        activeChat.listing?._id
      );
      setMessages([...messages, sentMsg]);
      setNewMessage('');
      fetchInbox(); // Update sidebar preview
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await chatService.deleteMessage(messageId);
      setMessages(messages.filter(m => m._id !== messageId));
      fetchInbox();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear entire conversation? This cannot be undone.')) return;
    try {
      await chatService.clearConversation(activeChat.partner._id, activeChat.listing?._id);
      setMessages([]);
      fetchInbox();
      toast.success('Conversation cleared');
    } catch (error) {
      toast.error('Failed to clear conversation');
    }
  };

  const getPartner = (conv) => {
    return conv.sender._id === user._id ? conv.receiver : conv.sender;
  };

  const handleSelectChat = (conv) => {
    const partner = getPartner(conv);
    setActiveChat({ ...conv, partner });
    setLoading(true);
  };

  if (!user) return <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>Please login to view messages.</div>;

  return (
    <div className={styles.container}>
      {/* Sidebar: Inbox */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Messages</h2>
        </div>
        <div className={styles.inboxList}>
          {inboxLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading conversations...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const partner = getPartner(conv);
              const isActive = activeChat?.partner?._id === partner._id && activeChat?.listing?._id === conv.listing?._id;
              
              return (
                <div 
                  key={conv._id} 
                  className={`${styles.conversationItem} ${isActive ? styles.activeConversation : ''}`}
                  onClick={() => handleSelectChat(conv)}
                >
                  <div className={styles.avatar}>
                    {partner.avatar ? <img src={partner.avatar} alt={partner.name} /> : <UserIcon size={24} />}
                  </div>
                  <div className={styles.convInfo}>
                    <div className={styles.convHeader}>
                      <span className={styles.convName}>{partner.name}</span>
                      <span className={styles.convTime}>
                        {format(new Date(conv.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <div className={styles.lastMsg}>
                      {conv.sender._id === user._id ? 'You: ' : ''}{conv.content}
                    </div>
                    {conv.listing && (
                      <div className={styles.listingInfo}>Re: {conv.listing.brand} {conv.listing.title.substring(0, 15)}...</div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && <div className={styles.unreadDot} />}
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <MessageSquare size={48} strokeWidth={1} />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat Thread */}
      <div className={styles.chatArea}>
        {activeChat ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>
                {activeChat.partner.avatar ? <img src={activeChat.partner.avatar} alt={activeChat.partner.name} /> : <UserIcon size={24} />}
              </div>
              <div>
                <h3 className={styles.chatTitle}>{activeChat.partner.name}</h3>
                {activeChat.listing && (
                  <Link to={`/listings/${activeChat.listing._id}`} className={styles.listingInfo}>
                    {activeChat.listing.brand} {activeChat.listing.title}
                  </Link>
                )}
              </div>
              <div style={{ flex: 1 }}></div>
              <button className={styles.headerAction} onClick={handleClearChat} title="Clear Chat">
                <Trash2 size={18} />
              </button>
            </div>

            <div className={styles.messages}>
              {loading ? (
                <div style={{ textAlign: 'center', margin: 'auto' }}>Loading messages...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`${styles.messageRow} ${msg.sender._id === user._id ? styles.sentRow : styles.receivedRow}`}
                  >
                    <div className={`${styles.bubble} ${msg.sender._id === user._id ? styles.sentBubble : styles.receivedBubble}`}>
                      {msg.content}
                      <div className={styles.msgTime}>
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </div>
                      {msg.sender._id === user._id && (
                        <button 
                          className={styles.deleteMsgBtn} 
                          onClick={() => handleDeleteMessage(msg._id)}
                          title="Delete Message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No messages in this chat yet.</div>
              )}
            </div>

            <div className={styles.inputArea}>
              <form className={styles.inputForm} onSubmit={handleSend}>
                <textarea
                  className={styles.input}
                  placeholder="Type your message..."
                  rows="1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  className={styles.sendBtn}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <ShieldCheck size={64} color="var(--color-accent-primary)" strokeWidth={1} />
            <h2>Your Conversations</h2>
            <p>Select a message thread or contact a seller to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
