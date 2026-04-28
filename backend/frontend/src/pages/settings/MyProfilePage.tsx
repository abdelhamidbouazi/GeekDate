import { useEffect, useState } from 'react';
import { Upload, X, Star, Eye, Heart, Camera, Crown, Pencil, Check } from 'lucide-react';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Gender, SexualPreferences, type ConnectedUserProfile, type Interest } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Backend sends enums as strings (JsonStringEnumConverter)
const genderLabel: Record<string, string> = {
  '0': 'Unknown', '1': 'Male', '2': 'Female',
  'Unknonw': 'Unknown', 'Male': 'Male', 'Female': 'Female',
};
const prefLabel: Record<string, string> = {
  '0': 'None', '1': 'Men', '2': 'Women', '3': 'Everyone',
  'None': 'None', 'Male': 'Men', 'Female': 'Women', 'Unknonw': 'Everyone',
};

// Convert string enum from API to numeric value for edit form
const genderToNum: Record<string, number> = { 'Unknonw': 0, 'Male': 1, 'Female': 2 };
const prefToNum: Record<string, number> = { 'None': 0, 'Male': 1, 'Female': 2, 'Unknonw': 3 };
function toGenderNum(v: string | number): number { return typeof v === 'number' ? v : (genderToNum[v] ?? 0); }
function toPrefNum(v: string | number): number { return typeof v === 'number' ? v : (prefToNum[v] ?? 0); }

export default function MyProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<ConnectedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', email: '', gender: Gender.Unknown as number,
    biography: '', sexualPreferences: SexualPreferences.None as number,
    userInterestIds: [] as string[], city: '',
  });
  const [allInterests, setAllInterests] = useState<Interest[]>([]);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMsgType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadProfile = async () => {
    try {
      const profileRes = await usersApi.getMyProfile();
      if (profileRes.data.isSucceeded && profileRes.data.data) setProfile(profileRes.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  const startEditing = async () => {
    if (!profile) return;
    setEditForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      gender: toGenderNum(profile.gender),
      biography: profile.biography || '',
      sexualPreferences: toPrefNum(profile.preferredGender),
      userInterestIds: profile.interests?.map(i => i.id) || [],
      city: profile.city || '',
    });
    if (allInterests.length === 0) {
      try {
        const res = await usersApi.getAllInterests();
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) setAllInterests(data);
      } catch { /* ignore */ }
    }
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      showMessage('First name, last name and email are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await usersApi.updateProfile(editForm);
      await loadProfile();
      updateUser({ firstName: editForm.firstName, lastName: editForm.lastName });
      setEditing(false);
      showMessage('Profile updated!');
    } catch {
      showMessage('Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const toggleInterest = (id: string) => {
    setEditForm(f => ({
      ...f,
      userInterestIds: f.userInterestIds.includes(id)
        ? f.userInterestIds.filter(i => i !== id)
        : [...f.userInterestIds, id],
    }));
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await usersApi.uploadImage(file);
      await loadProfile();
      showMessage('Photo uploaded!');
    } catch { showMessage('Failed to upload photo', 'error'); }
    setUploading(false);
  };

  const handleSetMain = async (photoId: string) => {
    try {
      await usersApi.setMainPhoto(photoId);
      await loadProfile();
      const mainPhoto = profile?.pictures.find(p => p.id === photoId);
      if (mainPhoto) updateUser({ profilePhotoUrl: mainPhoto.url });
      showMessage('Main photo updated!');
    } catch { showMessage('Failed to set main photo', 'error'); }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await usersApi.deletePhoto(photoId);
      await loadProfile();
      showMessage('Photo deleted');
    } catch { showMessage('Failed to delete photo', 'error'); }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!profile) return <div className="text-center py-16 text-text-light">Failed to load profile</div>;

  const mainPhoto = profile.pictures?.find(p => p.isMain);
  const age = profile.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / 3.15576e10) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!editing ? (
          <button onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition cursor-pointer border-none">
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer bg-white text-text">
              Cancel
            </button>
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition cursor-pointer border-none disabled:opacity-50">
              <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${msgType === 'success' ? 'bg-green-50 text-success' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="relative h-48 bg-gradient-to-r from-primary to-secondary">
          <div className="absolute -bottom-16 left-6">
            {mainPhoto ? (
              <img src={mainPhoto.url} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-gray-400">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
            )}
          </div>
        </div>

        <div className="pt-20 px-6 pb-6">
          {!editing ? (
            <>
              <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}{age ? `, ${age}` : ''}</h2>
              <p className="text-text-light">@{profile.userName}</p>

              <div className="flex gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1 text-text-light">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span>Fame: {profile.fameRating}</span>
                </div>
                <div className="flex items-center gap-1 text-text-light">
                  <Eye className="w-4 h-4" />
                  <span>{profile.profileViews} views</span>
                </div>
                <div className="flex items-center gap-1 text-text-light">
                  <Heart className="w-4 h-4 text-primary" />
                  <span>{profile.userLikes} likes</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div><span className="font-medium">Gender:</span> <span className="text-text-light">{genderLabel[String(profile.gender)] || 'Unknown'}</span></div>
                <div><span className="font-medium">Looking for:</span> <span className="text-text-light">{prefLabel[String(profile.preferredGender)] || 'Everyone'}</span></div>
                <div><span className="font-medium">Email:</span> <span className="text-text-light">{profile.email}</span></div>
                <div><span className="font-medium">Location:</span> <span className="text-text-light">{[profile.city, profile.country].filter(Boolean).join(', ') || 'Not set'}</span></div>
              </div>

              {profile.biography && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-1">About</h3>
                  <p className="text-text-light text-sm">{profile.biography}</p>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map(i => (
                      <span key={i.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        #{i.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-light mb-1">First Name</label>
                  <input type="text" value={editForm.firstName}
                    onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-light mb-1">Last Name</label>
                  <input type="text" value={editForm.lastName}
                    onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Email</label>
                <input type="email" value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-light mb-1">City</label>
                <input type="text" value={editForm.city}
                  onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: Gender.Male, l: 'Male' }, { v: Gender.Female, l: 'Female' }].map(o => (
                    <button key={o.v} type="button" onClick={() => setEditForm(f => ({ ...f, gender: o.v }))}
                      className={`py-2 rounded-lg text-sm font-medium transition cursor-pointer border-2 ${
                        editForm.gender === o.v ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-light hover:border-gray-400'
                      }`}>{o.l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Looking for</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: SexualPreferences.Male, l: 'Men' },
                    { v: SexualPreferences.Female, l: 'Women' },
                    { v: SexualPreferences.Unknown, l: 'Everyone' },
                  ].map(o => (
                    <button key={o.v} type="button" onClick={() => setEditForm(f => ({ ...f, sexualPreferences: o.v }))}
                      className={`py-2 rounded-lg text-sm font-medium transition cursor-pointer border-2 ${
                        editForm.sexualPreferences === o.v ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-light hover:border-gray-400'
                      }`}>{o.l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-light mb-1">About Me</label>
                <textarea value={editForm.biography} rows={3}
                  onChange={e => setEditForm(f => ({ ...f, biography: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none" />
              </div>

              {allInterests.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-text-light mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map(interest => (
                      <button key={interest.id} type="button" onClick={() => toggleInterest(interest.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer border-none ${
                          editForm.userInterestIds.includes(interest.id)
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
          )}
        </div>
      </div>

      {/* Photos Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Photos</h3>
            <p className="text-xs text-text-light mt-0.5">Click a photo to set it as your main profile picture</p>
          </div>
          {(profile.pictures?.length || 0) < 5 && (
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition cursor-pointer">
              <Camera className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Add Photo'}
              <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        {profile.pictures && profile.pictures.length > 0 ? (
          <div className="flex gap-3">
            {(() => {
              const main = profile.pictures.find(p => p.isMain) || profile.pictures[0];
              return (
                <div key={main.id} className="relative w-1/2 aspect-3/4 rounded-xl overflow-hidden group shrink-0">
                  <img src={main.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    <Crown className="w-3 h-3" /> Main
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-4">
                    <button onClick={() => handleDeletePhoto(main.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium cursor-pointer border-none hover:bg-red-600">
                      <X className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="flex-1 grid grid-cols-2 gap-3 content-start">
              {profile.pictures
                .filter(p => p.id !== (profile.pictures.find(pp => pp.isMain) || profile.pictures[0]).id)
                .map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                    onClick={() => handleSetMain(photo.id)}>
                    <img src={photo.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-white text-text rounded-lg text-xs font-medium">
                        <Crown className="w-3 h-3" /> Set as Main
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white rounded-lg text-xs font-medium cursor-pointer border-none hover:bg-red-600">
                        <X className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}

              {(profile.pictures?.length || 0) < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-text-light hover:border-primary hover:text-primary transition cursor-pointer">
                  <Camera className="w-6 h-6" />
                  <span className="text-xs font-medium">Add</span>
                  <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-text-light">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No photos yet. Upload your first photo!</p>
          </div>
        )}
      </div>
    </div>
  );
}
