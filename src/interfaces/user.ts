export interface Location {
    city: string;
    country: string;
  }
  
  export interface MatchPreferences {
    gender: string;
    ageRange: [number, number];
    distance: number;
  }
  
  export interface User {
    userId: string;
    username: string;
    profilePicture: string;
    bio: string;
    age: number;
    gender: string;
    location: Location;
    interests: string[];
    matchPreferences: MatchPreferences;
    isPremium: boolean;
    newMatchesCount: number;
    unreadMessagesCount: number;
    lastLogin: string;
    registrationDate: string;
  }
  
  export interface UserState {
    token: string | null;
    expiresIn: number | null;
    isProfileCompleted: boolean | null;
    user: User | null;
  }
  