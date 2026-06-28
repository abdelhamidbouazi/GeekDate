const AUTH = "/api/auth"
const USERS = "/api/Users"
const PROFILE = "/api/UserProfile"
const MATCHMAKING = "/api/Matchmaking"
const SEARCH_PREFS = "/api/search/preferences"
const INTEREST = "/api/Interest"
const CONVERSATION = "/api/Conversation"
const CHAT = "/api/Chat"
const NOTIFICATION = "/api/Notification"

export const endpoints = {
  auth: {
    register: `${AUTH}/register`,
    login: `${AUTH}/login`,
    verify: `${AUTH}/verify`,
    validateToken: `${AUTH}/validate-token`,
    refreshToken: `${AUTH}/refresh-token`,
    logout: `${AUTH}/logout`,
    forgotPassword: `${AUTH}/forgot-password`,
    resetPassword: `${AUTH}/reset-password`,
  },
  users: {
    list: USERS,
    me: `${USERS}/me`,
    byId: (userId: string) => `${USERS}/${userId}`,
    uploadImage: `${USERS}/upload-image`,
    setMainPhoto: (photoId: string) => `${USERS}/set-main-photo/${photoId}`,
    deletePhoto: (photoId: string) => `${USERS}/delete-photo/${photoId}`,
    likeProfile: (userId: string) => `${USERS}/like-profile/${userId}`,
    unlikeProfile: (userId: string) => `${USERS}/unlike-profile/${userId}`,
    markViewed: (userId: string) => `${USERS}/mark-profile-as-viewed/${userId}`,
    blockProfile: (userId: string) => `${USERS}/block-profile/${userId}`,
    unblockProfile: (userId: string) => `${USERS}/unblock-profile/${userId}`,
    profileViews: `${USERS}/profile-views`,
    profileLikes: `${USERS}/profile-likes`,
    likesGiven: `${USERS}/likes-given`,
  },
  profile: {
    me: `${PROFILE}/me`,
    completeBasic: `${PROFILE}/complete-basic-profile`,
    completePreferences: `${PROFILE}/complete-preferences`,
    setLocation: `${PROFILE}/set-location`,
    updateProfile: `${PROFILE}/update-profile`,
    blockedUsers: `${PROFILE}/blocked-users`,
  },
  matchmaking: {
    browse: MATCHMAKING,
    search: `${MATCHMAKING}/search`,
  },
  searchPreferences: {
    get: SEARCH_PREFS,
    update: SEARCH_PREFS,
    reset: `${SEARCH_PREFS}/reset`,
  },
  interests: {
    list: `${INTEREST}/list`,
    getAll: `${INTEREST}/GetAll`,
    create: INTEREST,
  },
  conversations: {
    list: CONVERSATION,
    withUser: (userId: string) => `${CONVERSATION}/with/${userId}`,
    byId: (conversationId: string) => `${CONVERSATION}/${conversationId}`,
  },
  chat: {
    messages: (conversationId: string) => `${CHAT}/conversations/${conversationId}/messages`,
    sendMessage: `${CHAT}/send-message`,
    updateMessage: (messageId: string) => `${CHAT}/messages/${messageId}`,
    deleteMessage: (messageId: string) => `${CHAT}/messages/${messageId}`,
    markRead: (conversationId: string) => `${CHAT}/conversations/${conversationId}/mark-read`,
    unreadCount: (conversationId: string) => `${CHAT}/conversations/${conversationId}/unread-count`,
  },
  notifications: {
    all: `${NOTIFICATION}`,
    unread: `${NOTIFICATION}/unread`,
    unreadCount: `${NOTIFICATION}/unread-count`,
    markRead: `${NOTIFICATION}/mark-read`,
    markOneRead: (id: string) => `${NOTIFICATION}/${id}/read`,
    delete: (id: string) => `${NOTIFICATION}/${id}`,
  },
} as const
