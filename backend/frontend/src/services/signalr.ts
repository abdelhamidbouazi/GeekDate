import * as signalR from '@microsoft/signalr';
import type { RealtimeMessage, RealtimeNotification } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5266';

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection | null {
  return connection;
}

export function createConnection(token: string): signalR.HubConnection {
  if (connection) {
    connection.stop();
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/chatHub?access_token=${token}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export async function startConnection(token: string): Promise<signalR.HubConnection> {
  const conn = createConnection(token);
  try {
    await conn.start();
  } catch (err) {
    console.error('SignalR connection failed:', err);
  }
  return conn;
}

export function stopConnection() {
  if (connection) {
    connection.stop();
    connection = null;
  }
}

export function onReceiveMessage(callback: (msg: RealtimeMessage) => void) {
  connection?.on('ReceiveMessage', callback);
}

export function offReceiveMessage(callback: (msg: RealtimeMessage) => void) {
  connection?.off('ReceiveMessage', callback);
}

export function onReceiveNotification(callback: (notif: RealtimeNotification) => void) {
  connection?.on('ReceiveNotification', callback);
}

export function offReceiveNotification(callback: (notif: RealtimeNotification) => void) {
  connection?.off('ReceiveNotification', callback);
}

export function onUserOnline(callback: (userId: string) => void) {
  connection?.on('UserOnline', (data: { userId: string } | string) => {
    callback(typeof data === 'string' ? data : data.userId);
  });
}

export function onUserOffline(callback: (userId: string) => void) {
  connection?.on('UserOffline', (data: { userId: string } | string) => {
    callback(typeof data === 'string' ? data : data.userId);
  });
}

export function offUserOnline() {
  connection?.off('UserOnline');
}

export function offUserOffline() {
  connection?.off('UserOffline');
}

export function onUserTyping(callback: (conversationId: string) => void) {
  connection?.on('UserTyping', (data: { conversationId: string } | string) => {
    callback(typeof data === 'string' ? data : data.conversationId);
  });
}

export function onUserStoppedTyping(callback: (conversationId: string) => void) {
  connection?.on('UserStoppedTyping', (data: { conversationId: string } | string) => {
    callback(typeof data === 'string' ? data : data.conversationId);
  });
}

export function offUserTyping() {
  connection?.off('UserTyping');
}

export function offUserStoppedTyping() {
  connection?.off('UserStoppedTyping');
}

export function onMessageUpdated(callback: (data: { messageId: string; messageText: string; conversationId: string }) => void) {
  connection?.on('MessageUpdated', callback);
}

export function offMessageUpdated(callback: (data: { messageId: string; messageText: string; conversationId: string }) => void) {
  connection?.off('MessageUpdated', callback);
}

export function onMessageDeleted(callback: (data: { messageId: string; conversationId: string }) => void) {
  connection?.on('MessageDeleted', callback);
}

export function offMessageDeleted(callback: (data: { messageId: string; conversationId: string }) => void) {
  connection?.off('MessageDeleted', callback);
}

export function joinConversation(conversationId: string) {
  connection?.invoke('JoinConversation', conversationId);
}

export function leaveConversation(conversationId: string) {
  connection?.invoke('LeaveConversation', conversationId);
}

export function sendTyping(conversationId: string) {
  connection?.invoke('UserTyping', conversationId);
}

export function sendStoppedTyping(conversationId: string) {
  connection?.invoke('UserStoppedTyping', conversationId);
}
