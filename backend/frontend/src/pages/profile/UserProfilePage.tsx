import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Ban, Flag, MapPin, Star, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { usersApi } from '../../api/users';
import { chatApi } from '../../api/chat';
import type { GetUserProfileById } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GetUserProfileById | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!userId) return;
    usersApi.markProfileAsViewed(userId).catch(() => {});
    usersApi.getUserById(userId).then(res => {
      if (res.data) setProfile(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  const refreshProfile = async () => {
    if (!userId) return;
    const res = await usersApi.getUserById(userId);
    if (res.data) setProfile(res.data);
  };

  const handleLike = async () => {
    if (!userId) return;
    setActionLoading('like');
    try {
      await usersApi.likeProfile(userId);
      await refreshProfile();
      showToast('Profile liked!');
    } catch {
      showToast('Failed to like profile', 'error');
    }
    setActionLoading('');
  };

  const handleUnlike = async () => {
    if (!userId) return;
    setActionLoading('unlike');
    try {
      await usersApi.unlikeProfile(userId);
      await refreshProfile();
      showToast('Like removed');
    } catch {
      showToast('Failed to unlike profile', 'error');
    }
    setActionLoading('');
  };

  const handleBlock = async () => {
    if (!userId) return;
    if (!confirm('Are you sure you want to block this user? This will remove all interactions.')) return;
    setActionLoading('block');
    try {
      await usersApi.blockProfile(userId);
      showToast('User blocked');
      setTimeout(() => navigate('/', { replace: true }), 500);
    } catch {
      showToast('Failed to block user', 'error');
    }
    setActionLoading('');
  };

  const handleChat = async () => {
    if (!userId) return;
    setActionLoading('chat');
    try {
      const res = await chatApi.getConversationWith(userId);
      if (res.data && res.data.id) {
        navigate(`/chat/${res.data.id}`);
        return;
      }
    } catch { /* no existing conversation */ }
    try {
      const res = await chatApi.createConversation(userId);
      if (res.data && res.data.id) {
        navigate(`/chat/${res.data.id}`);
        return;
      }
    } catch {
      showToast('Failed to start chat', 'error');
    }
    setActionLoading('');
  };

  const handleReport = () => {
    showToast('User reported as fake account. Thank you for keeping SparkDates safe!');
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!profile) return <div className="text-center py-16 text-text-light">User not found</div>;

  const allPhotos = profile.photos || [];
  const currentPhoto = allPhotos[selectedPhoto];
  const age = profile.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / 3.15576e10) : null;
  const lastActive = new Date(profile.lastActive);
  const isRecentlyOnline = (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;

  const genderMap: Record<string, string> = {
    '0': 'Unknown', '1': 'Male', '2': 'Female',
    'Unknown': 'Unknown', 'Male': 'Male', 'Female': 'Female',
  };
  const prefMap: Record<string, string> = {
    '0': 'None', '1': 'Men', '2': 'Women', '3': 'Everyone',
    'None': 'None', 'Male': 'Men', 'Female': 'Women', 'Unknonw': 'Everyone',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Photo Gallery */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {currentPhoto ? (
            <img src={currentPhoto.url} alt={profile.firstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl font-bold">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>
          )}

          {/* Photo navigation arrows */}
          {allPhotos.length > 1 && (
            <>
              <button onClick={() => setSelectedPhoto(p => (p - 1 + allPhotos.length) % allPhotos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center cursor-pointer border-none hover:bg-black/50 transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setSelectedPhoto(p => (p + 1) % allPhotos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center cursor-pointer border-none hover:bg-black/50 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Photo dots */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allPhotos.map((_, i) => (
                <button key={i} onClick={() => setSelectedPhoto(i)}
                  className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition ${i === selectedPhoto ? 'bg-white scale-110' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          {/* Online status badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${
              isRecentlyOnline ? 'bg-success/90 text-white' : 'bg-white/80 text-text-light'
            }`}>
              {isRecentlyOnline ? 'Online now' : `Last seen ${lastActive.toLocaleDateString()}`}
            </span>
          </div>

          {/* Match badge */}
          {profile.isMatched && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/90 text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
                <Heart className="w-3 h-3 fill-white" /> It's a Match!
              </span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          {/* Name + Fame */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}{age ? `, ${age}` : ''}</h1>
              <p className="text-text-light text-sm">@{profile.userName}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 rounded-lg">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-bold text-sm text-warning">{profile.fameRating ?? 0}</span>
            </div>
          </div>

          {/* Like status indicator */}
          {profile.isLikedByThem && !profile.isMatched && (
            <div className="mb-4 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 fill-primary" />
              This person likes you! Like them back to match.
            </div>
          )}

          {/* Details grid */}
          <div className="flex flex-wrap gap-3 mb-4 text-sm text-text-light">
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
                <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <div className="px-3 py-1.5 bg-gray-50 rounded-lg">
              Gender: {genderMap[String(profile.gender)] || 'Unknown'}
            </div>
            <div className="px-3 py-1.5 bg-gray-50 rounded-lg">
              Looking for: {prefMap[String(profile.sexualPreferences)] || 'Everyone'}
            </div>
          </div>

          {/* Bio */}
          {profile.biography && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1.5">About</h3>
              <p className="text-text-light text-sm leading-relaxed">{profile.biography}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <span key={i.interestId || i.id} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    #{i.name || i.interestId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-5 border-t border-border">
            {/* Like / Unlike — show contextually */}
            {profile.isLikedByMe ? (
              <button onClick={handleUnlike} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-primary rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer border-2 border-primary/20">
                <Heart className="w-4 h-4 fill-primary" />
                {actionLoading === 'unlike' ? 'Removing...' : 'Liked'}
              </button>
            ) : (
              <button onClick={handleLike} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer border-none shadow-sm">
                <Heart className="w-4 h-4" />
                {actionLoading === 'like' ? 'Liking...' : 'Like'}
              </button>
            )}

            {/* Chat — only show if matched */}
            {profile.isMatched && (
              <button onClick={handleChat} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer border-none shadow-sm">
                <MessageCircle className="w-4 h-4" />
                {actionLoading === 'chat' ? 'Opening...' : 'Send Message'}
              </button>
            )}

            {/* Spacer pushes danger actions right */}
            <div className="flex-1" />

            {/* Block */}
            <button onClick={handleBlock} disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-text-light rounded-xl text-sm font-medium hover:bg-red-50 hover:text-danger transition disabled:opacity-50 cursor-pointer border border-border">
              <Ban className="w-4 h-4" /> Block
            </button>

            {/* Report */}
            <button onClick={handleReport} disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-text-light rounded-xl text-sm font-medium hover:bg-yellow-50 hover:text-warning transition disabled:opacity-50 cursor-pointer border border-border">
              <Flag className="w-4 h-4" /> Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
