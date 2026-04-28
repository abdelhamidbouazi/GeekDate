import { useEffect, useState, useRef, type FormEvent } from 'react';
import { Send, ArrowLeft, Pencil, Trash2, X, Check, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatApi } from '../../api/chat';
import { usersApi } from '../../api/users';
import {
  joinConversation,
  leaveConversation,
  onReceiveMessage,
  offReceiveMessage,
  onMessageUpdated,
  offMessageUpdated,
  onMessageDeleted,
  offMessageDeleted,
  sendTyping,
  sendStoppedTyping,
  onUserTyping,
  onUserStoppedTyping,
  onUserOnline,
  onUserOffline,
  offUserOnline,
  offUserOffline,
} from '../../services/signalr';
import type { Message, RealtimeMessage, GetUserProfileById } from '../../types';
import { useChat } from '../../context/ChatContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  otherUserId?: string;
}

export default function ChatRoom({ conversationId, currentUserId, otherUserId }: ChatRoomProps) {
  const { refreshUnreadCount } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<GetUserProfileById | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [receiverId, setReceiverId] = useState(otherUserId || '');

  // Edit/delete state
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when switching conversations
    setReceiverId(otherUserId || '');
    setOtherUser(null);
    setMessages([]);

    loadMessages();
    joinConversation(conversationId);
    chatApi.markAsRead(conversationId).then(() => refreshUnreadCount()).catch(() => {});

    const msgHandler = (msg: RealtimeMessage) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg as Message];
        });
        chatApi.markAsRead(conversationId).then(() => refreshUnreadCount()).catch(() => {});
      }
    };
    onReceiveMessage(msgHandler);

    const typingHandler = (convId: string) => {
      if (convId === conversationId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };
    const stoppedHandler = (convId: string) => {
      if (convId === conversationId) setIsTyping(false);
    };
    onUserTyping(typingHandler);
    onUserStoppedTyping(stoppedHandler);

    // Listen for message edits
    const updateHandler = (data: { messageId: string; messageText: string; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.map(m =>
          m.id === data.messageId ? { ...m, messageText: data.messageText, updatedAt: new Date().toISOString() } : m
        ));
      }
    };
    onMessageUpdated(updateHandler);

    // Listen for message deletes
    const deleteHandler = (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      }
    };
    onMessageDeleted(deleteHandler);

    // Listen for online/offline status
    onUserOnline((userId) => {
      if (userId === otherUserId) setIsOnline(true);
    });
    onUserOffline((userId) => {
      if (userId === otherUserId) setIsOnline(false);
    });

    return () => {
      leaveConversation(conversationId);
      offReceiveMessage(msgHandler);
      offMessageUpdated(updateHandler);
      offMessageDeleted(deleteHandler);
      offUserOnline();
      offUserOffline();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close menu on click outside
  useEffect(() => {
    if (!menuMsgId) return;
    const handler = () => setMenuMsgId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuMsgId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await chatApi.getMessages(conversationId, 1, 100);
      if (res.data.isSucceeded && res.data.data) {
        const msgs = [...(res.data.data.data || [])].reverse();
        setMessages(msgs);
        const otherId = msgs.find(m => m.senderId !== currentUserId)?.senderId
          || msgs.find(m => m.receiverId !== currentUserId)?.receiverId
          || otherUserId;

        if (otherId) {
          setReceiverId(otherId);
          try {
            const userRes = await usersApi.getUserById(otherId);
            if (userRes.data) setOtherUser(userRes.data);
          } catch { /* ignore */ }
        }
      } else if (otherUserId) {
        // No messages yet — still load the other user's profile
        setReceiverId(otherUserId);
        try {
          const userRes = await usersApi.getUserById(otherUserId);
          if (userRes.data) setOtherUser(userRes.data);
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;
    setSending(true);
    try {
      const res = await chatApi.sendMessage(receiverId, newMessage.trim());
      if (res.data.isSucceeded && res.data.data) {
        const sent = res.data.data;
        setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
      }
      setNewMessage('');
      sendStoppedTyping(conversationId);
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleTyping = () => {
    sendTyping(conversationId);
  };

  const startEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditText(msg.messageText);
    setMenuMsgId(null);
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditText('');
  };

  const handleEditSave = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await chatApi.updateMessage(msgId, editText.trim());
      if (res.data.isSucceeded) {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, messageText: editText.trim(), updatedAt: new Date().toISOString() } : m
        ));
      }
    } catch { /* ignore */ }
    cancelEdit();
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm('Delete this message?')) return;
    setMenuMsgId(null);
    try {
      const res = await chatApi.deleteMessage(msgId);
      if (res.data.isSucceeded) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      }
    } catch { /* ignore */ }
  };

  const mainPhoto = otherUser?.photos?.find(p => p.isMain);

  if (loading) return <LoadingSpinner size="md" />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Link to="/chat" className="md:hidden text-text-light hover:text-text">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {otherUser && (
          <Link to={`/user/${receiverId}`} className="flex items-center gap-3 no-underline">
            <div className="relative">
              {mainPhoto ? (
                <img src={mainPhoto.url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
                  {otherUser.firstName?.[0] || '?'}
                </div>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm text-text">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              {isTyping ? (
                <span className="text-xs text-primary">typing...</span>
              ) : isOnline ? (
                <span className="text-xs text-green-500">Online</span>
              ) : otherUser.lastActive ? (
                <span className="text-xs text-text-light">Last seen {new Date(otherUser.lastActive).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              ) : null}
            </div>
          </Link>
        )}
        {!otherUser && (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">?</div>
            <div>
              <h3 className="font-medium text-sm">Chat</h3>
              {isTyping && <span className="text-xs text-primary">typing...</span>}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-text-light text-sm py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderId === currentUserId;
            const isEditing = editingMsgId === msg.id;
            const showMenu = menuMsgId === msg.id;

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="relative group max-w-[70%]">
                  {/* Message bubble */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEditSave(msg.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-lg border border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm min-w-[200px]"
                      />
                      <button onClick={() => handleEditSave(msg.id)}
                        className="p-1.5 bg-primary text-white rounded-lg cursor-pointer border-none hover:bg-primary-dark">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEdit}
                        className="p-1.5 bg-gray-200 text-text rounded-lg cursor-pointer border-none hover:bg-gray-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-gray-100 text-text rounded-bl-md'
                      }`}>
                        <p className="break-words">{msg.messageText}</p>
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? 'text-white/70' : 'text-text-light'}`}>
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.updatedAt && ' · edited'}
                          {isMine && msg.isRead && ' · Read'}
                        </div>
                      </div>

                      {/* Actions button for own messages */}
                      {isMine && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuMsgId(showMenu ? null : msg.id); }}
                          className={`absolute -left-8 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white shadow-sm border border-border cursor-pointer
                            ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
                          <MoreVertical className="w-3.5 h-3.5 text-text-light" />
                        </button>
                      )}

                      {/* Dropdown menu */}
                      {showMenu && (
                        <div className="absolute -left-28 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-border py-1 z-10 min-w-[100px]"
                          onClick={e => e.stopPropagation()}>
                          <button onClick={() => startEdit(msg)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left cursor-pointer border-none bg-transparent text-text">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(msg.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 w-full text-left cursor-pointer border-none bg-transparent text-red-500">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        />
        <button type="submit" disabled={sending || !newMessage.trim()}
          className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer border-none">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
