// lib/types.ts
// All data types for the app — mirrors the database schema exactly.

export type Region = {
  id: string
  label: string
  icon: string
  color: string
  sub: string
  description: string
}

export type Profile = {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  home_region: string | null
  location: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export type PostType = 'photo' | 'forum' | 'video'

export type Post = {
  id: string
  user_id: string
  region_id: string | null
  type: PostType
  title: string | null
  body: string | null
  image_url: string | null
  tags: string[]
  is_visitor_post: boolean
  like_count: number
  comment_count: number
  repost_count: number
  created_at: string
  updated_at: string
}

// Post joined with profile and region data (from posts_with_profiles view)
export type PostWithProfile = Post & {
  username: string
  full_name: string | null
  avatar_url: string | null
  home_region: string | null
  region_label: string | null
  region_icon: string | null
  region_color: string | null
  // Client-side extras (not from DB)
  is_liked?: boolean
  is_bookmarked?: boolean
  is_reposted?: boolean
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  body: string
  like_count: number
  created_at: string
}

export type CommentWithProfile = Comment & {
  username: string
  full_name: string | null
  avatar_url: string | null
  is_liked?: boolean
  replies?: CommentWithProfile[]
}

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type Like = {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string | null
  image_url: string | null
  created_at: string
}

export type Conversation = {
  id: string
  created_at: string
  // Joined fields
  members?: Profile[]
  last_message?: Message
  unread_count?: number
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'message'

export type Notification = {
  id: string
  user_id: string
  actor_id: string | null
  type: NotificationType
  post_id: string | null
  comment_id: string | null
  read: boolean
  created_at: string
  // Joined
  actor?: Profile
  post?: Post
}

// For the region sidebar / filter
export const REGIONS: Region[] = [
  { id: 'panhandle',  label: 'Panhandle',         icon: '🏖️', color: '#2B6CB0', sub: 'Pensacola · Destin · Panama City',         description: 'Gulf surf fishing, redfish, flounder, scalloping, dove hunting' },
  { id: 'northfl',   label: 'North Florida',      icon: '🌲', color: '#2E5D3E', sub: 'Tallahassee · Gainesville · Jacksonville',  description: 'Whitetail, turkey, bass fishing, Suwannee River' },
  { id: 'centralfl', label: 'Central Florida',    icon: '🐊', color: '#5C8C5A', sub: 'Orlando · Ocala · Tampa',                   description: 'Trophy bass, hog hunting, airboat, freshwater flats' },
  { id: 'swfl',      label: 'Southwest Florida',  icon: '🐚', color: '#38A89D', sub: 'Naples · Fort Myers · Sarasota',             description: 'Snook, tarpon, backcountry kayak, mangrove fishing' },
  { id: 'sefl',      label: 'Southeast Florida',  icon: '🦈', color: '#D4A832', sub: 'Miami · Palm Beach · Fort Lauderdale',       description: 'Offshore, mahi-mahi, sailfish, urban fishing spots' },
  { id: 'keys',      label: 'The Keys',            icon: '🦐', color: '#C8522A', sub: 'Key Largo · Marathon · Key West',            description: 'Permit, bonefish, tarpon on the flats — bucket list fishing' },
]