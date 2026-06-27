import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bell, User, LogOut, Eye, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { unreadMessageCount } = useChat();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl no-underline">
          <Heart className="w-6 h-6 fill-primary" />
          SparkDates
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" icon={<Heart className="w-5 h-5" />} label="Browse" />
          <NavLink to="/chat" icon={<MessageCircle className="w-5 h-5" />} label="Chat" badge={unreadMessageCount} />
          <NavLink to="/notifications" icon={<Bell className="w-5 h-5" />} label="Notifications" badge={unreadCount} />
          <NavLink to="/views" icon={<Eye className="w-5 h-5" />} label="Views" />
          <NavLink to="/likes" icon={<Heart className="w-5 h-5" />} label="Likes" />

          <div className="ml-2 flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 no-underline text-text">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{user?.userName}</span>
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-text-light border-none bg-transparent cursor-pointer" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 border-none bg-transparent cursor-pointer">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-border p-4 flex flex-col gap-1">
          <MobileNavLink to="/" label="Browse" onClick={() => setMenuOpen(false)} />
          <MobileNavLink to="/chat" label={`Chat${unreadMessageCount ? ` (${unreadMessageCount})` : ''}`} onClick={() => setMenuOpen(false)} />
          <MobileNavLink to="/notifications" label={`Notifications${unreadCount ? ` (${unreadCount})` : ''}`} onClick={() => setMenuOpen(false)} />
          <MobileNavLink to="/views" label="Who Viewed Me" onClick={() => setMenuOpen(false)} />
          <MobileNavLink to="/likes" label="Who Liked Me" onClick={() => setMenuOpen(false)} />
          <MobileNavLink to="/profile" label="My Profile" onClick={() => setMenuOpen(false)} />
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-danger border-none bg-transparent cursor-pointer text-base">
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}

function NavLink({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link to={to} className="relative flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-text-light hover:text-text no-underline text-sm" title={label}>
      {icon}
      <span className="hidden lg:inline">{label}</span>
      {badge ? (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="px-3 py-2 rounded-lg hover:bg-gray-100 text-text no-underline text-base">
      {label}
    </Link>
  );
}
