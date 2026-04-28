import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { usersApi } from '../../api/users';
import type { UserProfileLiked } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LikesPage() {
  const [likers, setLikers] = useState<UserProfileLiked[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getProfileLikes().then(res => {
      const data = res.data;
      setLikers(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-primary" /> Who Liked My Profile
      </h1>

      {likers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-text-light">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No likes yet</p>
          <p className="text-sm">Keep browsing and completing your profile!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {likers.map(liker => (
            <Link key={liker.id} to={`/user/${liker.id}`} className="no-underline">
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                {liker.profilePicture ? (
                  <img src={liker.profilePicture} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400">
                    {liker.firstName?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-text">{liker.firstName} {liker.lastName}</h3>
                  {liker.age && <p className="text-sm text-text-light">{liker.age} years old</p>}
                </div>
                <Heart className="w-5 h-5 text-primary fill-primary ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
