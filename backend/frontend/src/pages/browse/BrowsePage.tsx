import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { usersApi } from '../../api/users';
import { SearchSortBy, type BrowseUser, type Interest, type SearchPreferences } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function dedupeUsers(users: BrowseUser[]): BrowseUser[] {
  const seen = new Set<string>();
  return users.filter(u => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

const defaultPrefs: SearchPreferences = {
  minAge: 18, maxAge: 50, minFameRating: 0, maxFameRating: 200,
  maxDistanceKm: 100, savedInterestIds: [], sortBy: SearchSortBy.Distance,
  sortDescending: false, isFirstTime: true,
};

export default function BrowsePage() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [myInterests, setMyInterests] = useState<Interest[]>([]);
  const [prefs, setPrefs] = useState<SearchPreferences>(defaultPrefs);

  // Load default browse + preferences
  useEffect(() => {
    usersApi.browseUsers().then(res => {
      setUsers(dedupeUsers(Array.isArray(res.data) ? res.data : []));
    }).catch(() => {}).finally(() => setLoading(false));

    usersApi.getMyProfile().then(res => {
      const data = res.data?.data ?? res.data;
      setMyInterests(data?.interests || []);
    }).catch(() => {});

    usersApi.getSearchPreferences().then(res => {
      if (res.data.isSucceeded && res.data.data) setPrefs(res.data.data);
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
    setSearching(true);
    try {
      // Save preferences (non-blocking — don't let failure prevent search)
      usersApi.updateSearchPreferences(prefs).catch(() => {});
      const res = await usersApi.searchUsers(prefs);
      setUsers(dedupeUsers(Array.isArray(res.data) ? res.data : []));
      setIsFiltered(true);
      setFilterOpen(false);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setSearching(false);
  };

  const handleReset = async () => {
    try {
      await usersApi.resetSearchPreferences();
      const res = await usersApi.getSearchPreferences();
      if (res.data.isSucceeded && res.data.data) setPrefs(res.data.data);
    } catch { /* ignore */ }
    // Reload default browse
    setSearching(true);
    try {
      const res = await usersApi.browseUsers();
      setUsers(dedupeUsers(Array.isArray(res.data) ? res.data : []));
      setIsFiltered(false);
      setFilterOpen(false);
    } catch { /* ignore */ }
    setSearching(false);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          {isFiltered && (
            <p className="text-sm text-text-light mt-0.5">{users.length} result{users.length !== 1 ? 's' : ''} found</p>
          )}
        </div>
        <button onClick={() => setFilterOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer border-none ${
            isFiltered
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-white text-text shadow-sm hover:shadow-md'
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {isFiltered && <span className="w-2 h-2 rounded-full bg-white" />}
        </button>
      </div>

      {/* User Grid */}
      {searching ? (
        <LoadingSpinner size="lg" />
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-text-light">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No matches found</p>
          <p className="text-sm">Try adjusting your filters or check back later</p>
          {isFiltered && (
            <button onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition cursor-pointer border-none">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Filter Overlay */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto animate-slide-in"
            onClick={e => e.stopPropagation()}>
            <FilterPanel
              prefs={prefs}
              setPrefs={setPrefs}
              myInterests={myInterests}
              toggleInterest={toggleInterest}
              onSearch={handleSearch}
              onReset={handleReset}
              onClose={() => setFilterOpen(false)}
              searching={searching}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Filter Side Panel ─── */
interface FilterPanelProps {
  prefs: SearchPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<SearchPreferences>>;
  myInterests: Interest[];
  toggleInterest: (id: string) => void;
  onSearch: (e: FormEvent) => void;
  onReset: () => void;
  onClose: () => void;
  searching: boolean;
}

function FilterPanel({ prefs, setPrefs, myInterests, toggleInterest, onSearch, onReset, onClose, searching }: FilterPanelProps) {
  return (
    <form onSubmit={onSearch} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="text-lg font-bold">Filters</h2>
        <button type="button" onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 border-none bg-transparent cursor-pointer text-text-light">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-semibold mb-3">Age Range</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-text-light mb-1">Min</label>
              <input type="number" min={18} max={100} value={prefs.minAge}
                onChange={e => setPrefs(p => ({ ...p, minAge: +e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
            <span className="text-text-light mt-5">—</span>
            <div className="flex-1">
              <label className="block text-xs text-text-light mb-1">Max</label>
              <input type="number" min={18} max={100} value={prefs.maxAge}
                onChange={e => setPrefs(p => ({ ...p, maxAge: +e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">Distance</label>
            <span className="text-xs text-text-light">{prefs.maxDistanceKm ? `${prefs.maxDistanceKm} km` : 'No limit'}</span>
          </div>
          <input type="range" min={1} max={500} value={prefs.maxDistanceKm || 500}
            onChange={e => {
              const v = +e.target.value;
              setPrefs(p => ({ ...p, maxDistanceKm: v >= 500 ? null : v }));
            }}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-text-light mt-1">
            <span>1 km</span>
            <span>500+ km</span>
          </div>
        </div>

        {/* Fame Rating */}
        <div>
          <label className="block text-sm font-semibold mb-3">Fame Rating</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-text-light mb-1">Min</label>
              <input type="number" min={0} max={200} value={prefs.minFameRating}
                onChange={e => setPrefs(p => ({ ...p, minFameRating: +e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
            <span className="text-text-light mt-5">—</span>
            <div className="flex-1">
              <label className="block text-xs text-text-light mb-1">Max</label>
              <input type="number" min={0} max={200} value={prefs.maxFameRating}
                onChange={e => setPrefs(p => ({ ...p, maxFameRating: +e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold mb-3">Sort By</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: SearchSortBy.Distance, label: 'Distance' },
              { value: SearchSortBy.Age, label: 'Age' },
              { value: SearchSortBy.FameRating, label: 'Fame' },
              { value: SearchSortBy.CommonTags, label: 'Common Tags' },
            ].map(opt => (
              <button key={opt.value} type="button"
                onClick={() => setPrefs(p => ({ ...p, sortBy: opt.value }))}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition cursor-pointer border-2 ${
                  prefs.sortBy === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-text-light hover:border-gray-400'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={prefs.sortDescending}
              onChange={e => setPrefs(p => ({ ...p, sortDescending: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-text-light">Descending order</span>
          </label>
        </div>

        {/* Interests */}
        {myInterests.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-3">Interests</label>
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
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border space-y-3">
        <button type="submit" disabled={searching}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer border-none text-base">
          {searching ? 'Searching...' : 'Apply Filters'}
        </button>
        <button type="button" onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-text-light hover:bg-gray-100 transition cursor-pointer border-none bg-transparent">
          <RotateCcw className="w-4 h-4" /> Reset to Defaults
        </button>
      </div>
    </form>
  );
}

/* ─── User Card ─── */
function UserCard({ user }: { user: BrowseUser }) {
  const distanceKm = (user.distanceInMeters / 1000).toFixed(1);

  return (
    <Link to={`/user/${user.id}`} className="no-underline">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group cursor-pointer">
        <div className="aspect-3/4 relative overflow-hidden bg-gray-100">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.firstName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          {/* Gradient overlay with info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
            <h3 className="text-white font-bold text-lg leading-tight">
              {user.firstName}, {user.age || '?'}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <MapPin className="w-3 h-3" /> {distanceKm} km
              </span>
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Star className="w-3 h-3 fill-white/80" /> {user.fameRating}
              </span>
            </div>
            {user.commonTagsCount > 0 && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                {user.commonTagsCount} common interest{user.commonTagsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
