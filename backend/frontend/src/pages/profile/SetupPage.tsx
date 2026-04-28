import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Upload, X, Camera, Star, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';
import { interestsApi } from '../../api/interests';
import { Gender, SexualPreferences, type Interest } from '../../types';

const TOTAL_STEPS = 3;

export default function SetupPage() {
  const { user, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — basic info
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Male);

  // Step 2 — photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // Step 3 — preferences & interests
  const [biography, setBiography] = useState('');
  const [preferredGender, setPreferredGender] = useState<SexualPreferences>(SexualPreferences.Unknown);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    interestsApi.getAll().then(res => {
      if (res.data.isSucceeded) setAllInterests(res.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading && user?.isProfileCompleted) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining);
    setPhotos(prev => [...prev, ...toAdd]);
    setPhotoPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    if (mainPhotoIndex === index) {
      setMainPhotoIndex(0);
    } else if (mainPhotoIndex > index) {
      setMainPhotoIndex(prev => prev - 1);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!dateOfBirth) { setError('Please enter your date of birth'); return; }
    setError('');
    setStep(2);
  };

  const handleStep2 = (e: FormEvent) => {
    e.preventDefault();
    if (photos.length < 2) { setError('Add at least 2 photos (1 main + 1 additional)'); return; }
    setError('');
    setStep(3);
  };

  const handleStep3 = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) { setError('Please select at least 1 interest'); return; }
    setError('');
    setLoading(true);
    try {
      // Step 1 API — basic info + main photo
      const basicForm = new FormData();
      basicForm.append('DateOfBirth', new Date(dateOfBirth).toISOString());
      basicForm.append('Gender', String(gender));
      basicForm.append('MainPicture', photos[mainPhotoIndex]);
      await usersApi.completeBasicProfile(basicForm);

      // Step 2 API — preferences + remaining (non-main) photos
      const prefForm = new FormData();
      prefForm.append('Biography', biography);
      prefForm.append('PreferredGender', String(preferredGender));
      prefForm.append('Gender', String(gender));
      selectedInterests.forEach(id => prefForm.append('UserInterestIds', id));
      photos.forEach((p, i) => {
        if (i !== mainPhotoIndex) prefForm.append('Pictures', p);
      });
      await usersApi.completePreferences(prefForm);

      updateUser({ isProfileCompleted: true });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    }
    setLoading(false);
  };

  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    .toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2 text-primary">
        <Heart className="w-8 h-8 fill-primary" />
        <span className="text-2xl font-bold">Complete Your Profile</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`w-10 h-1.5 rounded-full transition-colors ${step > i ? 'bg-primary' : 'bg-gray-300'}`} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {error && <div className="bg-red-50 text-danger rounded-lg p-3 mb-4 text-sm">{error}</div>}

        {/* ─── STEP 1: BASIC INFO ─── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">About You</h3>
            <p className="text-text-light text-sm -mt-3">Let's start with the basics</p>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required
                max={maxDob}
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">I am</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setGender(Gender.Male)}
                  className={`py-3 rounded-lg font-medium transition border-2 cursor-pointer text-base ${
                    gender === Gender.Male
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-light hover:border-gray-400'
                  }`}>
                  Man
                </button>
                <button type="button" onClick={() => setGender(Gender.Female)}
                  className={`py-3 rounded-lg font-medium transition border-2 cursor-pointer text-base ${
                    gender === Gender.Female
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-light hover:border-gray-400'
                  }`}>
                  Woman
                </button>
              </div>
            </div>

            <button type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition cursor-pointer border-none text-base mt-2">
              Continue
            </button>
          </form>
        )}

        {/* ─── STEP 2: PHOTOS ─── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">Add Photos</h3>
            <p className="text-text-light text-sm -mt-3">
              Add at least 2 photos. Tap the star to set your main profile picture.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* First slot — large (2x2) */}
              {photoPreviews.length > 0 ? (
                <div
                  className={`relative col-span-2 row-span-2 aspect-square rounded-xl overflow-hidden border-3 transition cursor-pointer ${
                    mainPhotoIndex === 0 ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setMainPhotoIndex(0)}>
                  <img src={photoPreviews[0]} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={e => { e.stopPropagation(); removePhoto(0); }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center border-none cursor-pointer p-0 hover:bg-black/80">
                    <X className="w-4 h-4" />
                  </button>
                  {mainPhotoIndex === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> MAIN
                    </div>
                  )}
                </div>
              ) : (
                <label className="col-span-2 row-span-2 aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                  <Camera className="w-10 h-10 text-text-light mb-2" />
                  <span className="text-sm text-text-light font-medium">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                </label>
              )}

              {/* Slots 1–4 (small) */}
              {[1, 2, 3, 4].map(slotIndex => {
                if (slotIndex < photoPreviews.length) {
                  return (
                    <div
                      key={slotIndex}
                      className={`relative aspect-square rounded-xl overflow-hidden border-3 transition cursor-pointer ${
                        mainPhotoIndex === slotIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setMainPhotoIndex(slotIndex)}>
                      <img src={photoPreviews[slotIndex]} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={e => { e.stopPropagation(); removePhoto(slotIndex); }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center border-none cursor-pointer p-0 hover:bg-black/80">
                        <X className="w-3 h-3" />
                      </button>
                      {mainPhotoIndex === slotIndex && (
                        <div className="absolute bottom-1 left-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                      )}
                    </div>
                  );
                }
                if (slotIndex === photoPreviews.length && photos.length < 5) {
                  return (
                    <label key={slotIndex} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                      <Upload className="w-5 h-5 text-text-light" />
                      <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                    </label>
                  );
                }
                return (
                  <div key={slotIndex} className="aspect-square rounded-xl bg-gray-50 border border-border" />
                );
              })}
            </div>

            <p className="text-xs text-text-light text-center">
              {photos.length}/5 photos added{photos.length < 2 && ' — minimum 2 required'}
            </p>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => { setStep(1); setError(''); }}
                className="flex items-center justify-center gap-1 flex-1 bg-gray-100 text-text py-3 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer border-none text-base">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit"
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition cursor-pointer border-none text-base disabled:opacity-50"
                disabled={photos.length < 2}>
                Continue
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 3: PREFERENCES & INTERESTS ─── */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">Your Preferences</h3>
            <p className="text-text-light text-sm -mt-3">Almost done! Tell us what you're looking for.</p>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea value={biography} onChange={e => setBiography(e.target.value)} rows={3} maxLength={500}
                placeholder="Tell people about yourself..."
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">I'm interested in</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: SexualPreferences.Male, label: 'Men' },
                  { value: SexualPreferences.Female, label: 'Women' },
                  { value: SexualPreferences.Unknown, label: 'Everyone' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setPreferredGender(opt.value)}
                    className={`py-2.5 rounded-lg font-medium transition border-2 cursor-pointer text-sm ${
                      preferredGender === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-text-light hover:border-gray-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {allInterests.map(interest => (
                  <button key={interest.id} type="button" onClick={() => toggleInterest(interest.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer border-none ${
                      selectedInterests.includes(interest.id)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-light hover:bg-gray-200'
                    }`}>
                    #{interest.name}
                  </button>
                ))}
                {allInterests.length === 0 && (
                  <span className="text-sm text-text-light">Loading interests...</span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => { setStep(2); setError(''); }}
                className="flex items-center justify-center gap-1 flex-1 bg-gray-100 text-text py-3 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer border-none text-base">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer border-none text-base">
                {loading ? 'Setting up...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
