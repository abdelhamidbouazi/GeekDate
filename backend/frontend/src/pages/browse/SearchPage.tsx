import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal } from 'lucide-react';
import { usersApi } from '../../api/users';
import { SearchSortBy, type BrowseUser, type Interest, type SearchPreferences } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SearchPage() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [myInterests, setMyInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [prefs, setPrefs] = useState<SearchPreferences>({
    minAge: 18, maxAge: 50, minFameRating: 0, maxFameRating: 200,
    maxDistanceKm: 100, savedInterestIds: [], sortBy: SearchSortBy.Distance,
    sortDescending: false, isFirstTime: true,
  });

  useEffect(() => {
    // Load user's own interests (these come with IDs from profile endpoint)
    usersApi.getMyProfile().then(res => {
      setMyInterests(res.data.interests || []);
    }).catch(() => {});

    usersApi.getSearchPreferences().then(res => {
      if (res.data.isSucceeded && res.data.data) {
        setPrefs(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const toggleInterest = (id: string) => {
    setPrefs(p => ({
      ...p,
      savedInterestIds: p.savedInterestIds.includes(id)
        ? p.savedInterestIds.filter(i => i !== id)
        : [...p.savedInterestIds, id],
    }));
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.updateSearchPreferences(prefs);
      const res = await usersApi.searchUsers(prefs);
      const data = res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await usersApi.resetSearchPreferences();
      const res = await usersApi.getSearchPreferences();
      if (res.data.isSucceeded && res.data.data) setPrefs(res.data.data);
      setUsers([]);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6" /> Advanced Search
        </h1>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer border-none">
          <SlidersHorizontal className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Age Range</label>
              <div className="flex items-center gap-2">
                <input type="number" min={18} max={100} value={prefs.minAge} onChange={e => setPrefs(p => ({ ...p, minAge: +e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none text-sm" />
                <span className="text-text-light">to</span>
                <input type="number" min={18} max={100} value={prefs.maxAge} onChange={e => setPrefs(p => ({ ...p, maxAge: +e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fame Rating Range</label>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={200} value={prefs.minFameRating} onChange={e => setPrefs(p => ({ ...p, minFameRating: +e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none text-sm" />
                <span className="text-text-light">to</span>
                <input type="number" min={0} max={200} value={prefs.maxFameRating} onChange={e => setPrefs(p => ({ ...p, maxFameRating: +e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Distance (km)</label>
              <input type="number" min={1} max={20000} value={prefs.maxDistanceKm || ''} onChange={e => setPrefs(p => ({ ...p, maxDistanceKm: +e.target.value || null }))}
                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none text-sm" placeholder="No limit" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select value={prefs.sortBy} onChange={e => setPrefs(p => ({ ...p, sortBy: e.target.value as SearchSortBy }))}
                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none text-sm bg-white">
                <option value={SearchSortBy.Distance}>Distance</option>
                <option value={SearchSortBy.Age}>Age</option>
                <option value={SearchSortBy.FameRating}>Fame Rating</option>
                <option value={SearchSortBy.CommonTags}>Common Tags</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={prefs.sortDescending} onChange={e => setPrefs(p => ({ ...p, sortDescending: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm">Descending</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Filter by My Interests</label>
            <div className="flex flex-wrap gap-2">
              {myInterests.map(interest => (
                <button key={interest.id} type="button" onClick={() => toggleInterest(interest.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer border-none ${
                    prefs.savedInterestIds.includes(interest.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-light hover:bg-gray-200'
                  }`}>
                  #{interest.name}
                </button>
              ))}
              {myInterests.length === 0 && (
                <span className="text-sm text-text-light">No interests on your profile yet</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer border-none">
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" onClick={handleReset}
              className="px-6 bg-gray-100 text-text py-2.5 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer border-none">
              Reset
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map(user => (
            <Link key={user.id} to={`/user/${user.id}`} className="no-underline">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h3 className="text-white font-bold text-lg">{user.firstName}, {user.age || '?'}</h3>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-text-light text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{(user.distanceInMeters / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-light text-sm">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    <span>Fame: {user.fameRating}</span>
                  </div>
                  {user.commonTagsCount > 0 && (
                    <div className="text-xs text-primary font-medium">
                      {user.commonTagsCount} common interest{user.commonTagsCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-light">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No results</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
