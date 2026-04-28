import api from './client';
import type { ApiResponse, BrowseUser, ConnectedUserProfile, GetUserProfileById, ImageDto, SearchPreferences, UserDto, UserProfileLiked, UserProfileViewer } from '../types';

export const usersApi = {
  // RAW — returns UserDto directly
  getMe: () =>
    api.get<UserDto>('/users/me'),

  // RAW — returns AppUser/GetUserProfileById directly
  getUserById: (userId: string) =>
    api.get<GetUserProfileById>(`/users/${userId}`),

  // WRAPPED — returns Response<ConnectedUserProfileDto>
  getMyProfile: () =>
    api.get<ApiResponse<ConnectedUserProfile>>('/userprofile/me'),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ImageDto>('/users/upload-image', form, {
      headers: { 'Content-Type': undefined },
    });
  },

  setMainPhoto: (photoId: string) =>
    api.put(`/users/set-main-photo/${photoId}`),

  deletePhoto: (photoId: string) =>
    api.delete(`/users/delete-photo/${photoId}`),

  likeProfile: (userId: string) =>
    api.post(`/users/like-profile/${userId}`),

  unlikeProfile: (userId: string) =>
    api.post(`/users/unlike-profile/${userId}`),

  blockProfile: (userId: string) =>
    api.post(`/users/block-profile/${userId}`),

  markProfileAsViewed: (userId: string) =>
    api.post(`/users/mark-profile-as-viewed/${userId}`),

  getProfileViews: () =>
    api.get<UserProfileViewer[]>('/users/profile-views'),

  getProfileLikes: () =>
    api.get<UserProfileLiked[]>('/users/profile-likes'),

  completeBasicProfile: (data: FormData) =>
    api.put('/userprofile/complete-basic-profile', data, {
      headers: { 'Content-Type': undefined },
    }),

  completePreferences: (data: FormData) =>
    api.put('/userprofile/complete-preferences', data, {
      headers: { 'Content-Type': undefined },
    }),

  // RAW — returns BrowseUserDto[] directly
  browseUsers: () =>
    api.get<BrowseUser[]>('/matchmaking'),

  // RAW — returns BrowseUserDto[] directly
  searchUsers: (preferences: SearchPreferences) =>
    api.post<BrowseUser[]>('/matchmaking/search', preferences),

  getSearchPreferences: () =>
    api.get<ApiResponse<SearchPreferences>>('/search/preferences'),

  updateSearchPreferences: (prefs: SearchPreferences) =>
    api.put('/search/preferences', prefs),

  resetSearchPreferences: () =>
    api.post('/search/preferences/reset'),

  updateProfile: (data: {
    firstName: string;
    lastName: string;
    email: string;
    gender: number;
    biography: string;
    sexualPreferences: number;
    userInterestIds: string[];
    city: string;
  }) => api.put<ApiResponse<unknown>>('/userprofile/update-profile', data),

  getAllInterests: () =>
    api.get<ApiResponse<{ id: string; name: string }[]>>('/interest/list'),
};
