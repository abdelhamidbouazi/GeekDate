import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { chatApi } from '../../api/chat';
import { usersApi } from '../../api/users';
import { onReceiveMessage, offReceiveMessage, onUserOnline, onUserOffline, offUserOnline, offUserOffline } from '../../services/signalr';
import { useChat } from '../../context/ChatContext';
import type { Conversation, GetUserProfileById, RealtimeMessage } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ChatRoom from './ChatRoom';

function getCurrentUserId(): string {
  const token = localStorage.getItem('accessToken');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || payload.nameid || '';
  } catch { return ''; }
}

/** Sort conversations by latest message time (newest first) */
function sortByLatestMessage(convos: Conversation[]): Conversation[] {
  return [...convos].sort((a, b) => {
    const aTime = a.messages?.length ? new Date(a.messages[a.messages.length - 1].sentAt).getTime() : new Date(a.createdAt).getTime();
    const bTime = b.messages?.length ? new Date(b.messages[b.messages.length - 1].sentAt).getTime() : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

export default function ChatListPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { refreshUnreadCount } = useChat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, GetUserProfileById>>({});
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const currentUserId = useRef(getCurrentUserId());

  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      if (res.data.isSucceeded) {
        const convos = sortByLatestMessage(res.data.data || []);
        setConversations(convos);

        // Load profiles for any new users we haven't fetched yet
        const myId = currentUserId.current;
        const newUserIds = convos
          .map(c => c.user1Id === myId ? c.user2Id : c.user1Id)
          .filter(id => !userProfiles[id]);

        if (newUserIds.length > 0) {
          const profiles: Record<string, GetUserProfileById> = {};
          await Promise.all(
            newUserIds.map(async (id) => {
              try {
                const r = await usersApi.getUserById(id);
                if (r.data) profiles[id] = r.data;
              } catch { /* ignore */ }
            })
          );
          setUserProfiles(prev => ({ ...prev, ...profiles }));
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [userProfiles]);

  // Initial load
  useEffect(() => { loadConversations(); }, []);

  // Re-fetch conversation list on incoming messages (reorders + updates unread counts)
  useEffect(() => {
    const handler = (_msg: RealtimeMessage) => { loadConversations(); };
    onReceiveMessage(handler);
    return () => offReceiveMessage(handler);
  }, [loadConversations]);

  // Track online/offline users
  useEffect(() => {
    onUserOnline((userId) => setOnlineUsers(prev => new Set(prev).add(userId)));
    onUserOffline((userId) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; }));
    return () => { offUserOnline(); offUserOffline(); };
  }, []);

  // When entering a conversation, clear its unread count locally + refresh global badge
  useEffect(() => {
    if (!conversationId) return;
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
    );
    refreshUnreadCount();
  }, [conversationId, refreshUnreadCount]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col ${conversationId ? 'hidden md:flex' : ''}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-text-light text-sm">
              No conversations yet. Like someone and get liked back to start chatting!
            </div>
          ) : (
            conversations.map(conv => {
              const otherId = conv.user1Id === currentUserId.current ? conv.user2Id : conv.user1Id;
              const otherUser = userProfiles[otherId];
              const mainPhoto = otherUser?.photos?.find(p => p.isMain);
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              const isActive = conversationId === conv.id;
              const isUserOnline = onlineUsers.has(otherId);

              return (
                <Link key={conv.id} to={`/chat/${conv.id}`} className="no-underline">
                  <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition cursor-pointer ${isActive ? 'bg-primary/5 border-r-2 border-primary' : ''}`}>
                    <div className="relative flex-shrink-0">
                      {mainPhoto ? (
                        <img src={mainPhoto.url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400">
                          {otherUser?.firstName?.[0] || '?'}
                        </div>
                      )}
                      {isUserOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate text-text">
                          {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-text-light truncate mt-0.5">{lastMsg.messageText}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 ${!conversationId ? 'hidden md:flex' : 'flex'} flex-col`}>
        {conversationId ? (
          <ChatRoom conversationId={conversationId} currentUserId={currentUserId.current}
            otherUserId={(() => {
              const conv = conversations.find(c => c.id === conversationId);
              if (!conv) return undefined;
              return conv.user1Id === currentUserId.current ? conv.user2Id : conv.user1Id;
            })()} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-light">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose from your existing conversations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
