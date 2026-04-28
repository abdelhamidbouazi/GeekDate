import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { chatApi } from '../api/chat';
import { onReceiveMessage, offReceiveMessage } from '../services/signalr';
import { useAuth } from './AuthContext';
import type { RealtimeMessage } from '../types';

interface ChatContextType {
  unreadMessageCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await chatApi.getConversations();
      if (res.data.isSucceeded) {
        const convos = res.data.data || [];
        const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadMessageCount(total);
      }
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessageCount(0);
      return;
    }
    refreshUnreadCount();

    const handler = (_msg: RealtimeMessage) => {
      refreshUnreadCount();
    };
    onReceiveMessage(handler);
    return () => offReceiveMessage(handler);
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <ChatContext.Provider value={{ unreadMessageCount, refreshUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
