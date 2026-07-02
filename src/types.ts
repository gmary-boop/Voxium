export type PostType = 'reel' | 'thread';
export type ClassificationColor = 'green' | 'blue' | 'red';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  banner: string;
  followersCount: number;
  followingCount: number;
  followedByUser?: boolean;
  isVerified?: boolean;
  isAiBot?: boolean;
  isBanned?: boolean;
  hasWarning?: boolean;
  tokens?: number;
  isPremium?: boolean;
}

export interface Post {
  id: string;
  type: PostType;
  authorId: string;
  author: UserProfile;
  content: string; // Used as description in reels, body text in threads
  mediaUrl?: string; // Video URL for reels, image/video URL for threads
  soundName?: string; // Audio track name
  likesCount: number;
  repliesCount: number;
  likedByUser?: boolean;
  createdAt: string; // ISO string
  parentId?: string; // For replies (nested thread items)
  tags: string[];
  classification: ClassificationColor; // 'green' | 'blue' | 'red'
  isDeleted?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: UserProfile;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  sender: UserProfile;
  targetPostId?: string;
  targetPostType?: PostType;
  message?: string;
  createdAt: string;
  read: boolean;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  suggestedColor: ClassificationColor;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  postExcerpt?: string;
}

export interface AppState {
  currentUser: UserProfile;
  activeView: 'threads' | 'reels' | 'create' | 'activity' | 'profile' | 'search' | 'chat' | 'admin' | 'monetization' | 'mobile-setup';
  searchQuery: string;
}
