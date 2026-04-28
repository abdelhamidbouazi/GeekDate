import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { usersApi } from '../../api/users';
import type { UserProfileViewer } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ViewsPage() {
  const [viewers, setViewers] = useState<UserProfileViewer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getProfileViews().then(res => {
      const data = res.data;
      setViewers(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Eye className="w-6 h-6" /> Who Viewed My Profile
      </h1>

      {viewers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-text-light">
          <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No views yet</p>
          <p className="text-sm">Complete your profile to attract more visitors</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {viewers.map(viewer => (
            <Link key={viewer.id} to={`/user/${viewer.id}`} className="no-underline">
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                {viewer.profilePicture ? (
                  <img src={viewer.profilePicture} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-400">
                    {viewer.firstName?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-text">{viewer.firstName} {viewer.lastName}</h3>
                  {viewer.age && <p className="text-sm text-text-light">{viewer.age} years old</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
