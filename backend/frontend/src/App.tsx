import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';

import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

import SetupPage from './pages/profile/SetupPage';
import BrowsePage from './pages/browse/BrowsePage';
import SearchPage from './pages/browse/SearchPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import MyProfilePage from './pages/settings/MyProfilePage';
import ViewsPage from './pages/profile/ViewsPage';
import LikesPage from './pages/profile/LikesPage';

import ChatListPage from './pages/chat/ChatListPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <ChatProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            {/* Profile setup */}
            <Route path="/setup" element={<SetupPage />} />

            {/* App routes (protected) */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<BrowsePage />} />
              <Route path="/search" element={<Navigate to="/" replace />} />
              <Route path="/user/:userId" element={<UserProfilePage />} />
              <Route path="/profile" element={<MyProfilePage />} />
              <Route path="/views" element={<ViewsPage />} />
              <Route path="/likes" element={<LikesPage />} />
              <Route path="/chat" element={<ChatListPage />} />
              <Route path="/chat/:conversationId" element={<ChatListPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
