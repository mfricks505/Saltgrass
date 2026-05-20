'use client'
// src/components/PostCard.tsx
// The main post card used throughout the feed.

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import type { PostWithProfile } from '@/lib/types'
import toast from 'react-hot-toast'

interface Props {
  post: PostWithProfile
  onUpdate?: () => void
  showFullBody?: boolean
}

export default function PostCard({ post, onUpdate, showFullBody }: Props) {
  const supabase = createClient()
  const [liked, setLiked] = useState(post.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked ?? false)

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sign in to like posts'); return }

    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', post.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: post.id })
      setLiked(true)
      setLikeCount(c => c + 1)
    }
  }

  async function toggleBookmark() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sign in to bookmark'); return }

    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', post.id)
      setBookmarked(false)
      toast.success('Removed from bookmarks')
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: post.id })
      setBookmarked(true)
      toast.success('Bookmarked!')
    }
  }

  async function handleRepost() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sign in to repost'); return }
    await supabase.from('reposts').insert({ user_id: user.id, post_id: post.id })
    toast.success('Reposted!')
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
      {/* Photo */}
      {post.image_url && (
        <Link href={`/post/${post.id}`}>
          <img
            src={post.image_url} alt=""
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
          />
        </Link>
      )}

      <div style={{ padding: '14px 18px 16px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Link href={`/profile/${post.username}`}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${post.region_color || '#2E5D3E'}, #1C3A2A)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, border: '2px solid #E8DFC8', overflow: 'hidden',
            }}>
              {post.avatar_url
                ? <img src={post.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🧑'
              }
            </div>
          </Link>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Link href={`/profile/${post.username}`} style={{ fontWeight: 700, fontSize: 14, color: '#1C3A2A', textDecoration: 'none' }}>
                {post.full_name || post.username}
              </Link>
              <span style={{ color: '#bbb', fontSize: 12 }}>@{post.username}</span>
              <span style={{ color: '#ddd', fontSize: 12 }}>·</span>
              <span style={{ color: '#aaa', fontSize: 12 }}>{timeAgo}</span>
            </div>
            {/* Region badge */}
            {post.region_id && (
              <Link href={`/regions/${post.region_id}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  background: `${post.region_color}20`, color: post.region_color ?? '#2E5D3E',
                  border: `1px solid ${post.region_color}44`,
                  borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2,
                }}>
                  {post.region_icon} {post.region_label}
                  {post.is_visitor_post && <span style={{ opacity: 0.7 }}> · visitor</span>}
                </span>
              </Link>
            )}
          </div>

          {/* Post type pill */}
          <span style={{
            background: post.type === 'photo' ? '#2B6CB018' : '#C8522A18',
            color: post.type === 'photo' ? '#2B6CB0' : '#C8522A',
            borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 800, flexShrink: 0,
          }}>
            {post.type === 'photo' ? '📸 Photo' : post.type === 'video' ? '🎥 Video' : '💬 Forum'}
          </span>
        </div>

        {/* Title */}
        {post.title && (
          <Link href={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1A2015', marginBottom: 6, lineHeight: 1.4 }}>
              {post.title}
            </div>
          </Link>
        )}

        {/* Body */}
        {post.body && (
          <div style={{
            fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 10,
            ...(!showFullBody ? {
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any,
            } : {}),
          }}>
            {post.body}
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ background: '#2E5D3E15', color: '#2E5D3E', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderTop: '1px solid #F5EFE0', paddingTop: 10 }}>
          {/* Like */}
          <button onClick={toggleLike} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: liked ? '#C8522A12' : 'none', border: 'none',
            borderRadius: 20, padding: '6px 12px',
            cursor: 'pointer', color: liked ? '#C8522A' : '#888',
            fontWeight: 600, fontSize: 13,
          }}>
            {liked ? '❤️' : '🤍'} {likeCount.toLocaleString()}
          </button>

          {/* Comment */}
          <Link href={`/post/${post.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', borderRadius: 20, padding: '6px 12px',
            color: '#888', fontWeight: 600, fontSize: 13, textDecoration: 'none',
          }}>
            💬 {post.comment_count}
          </Link>

          {/* Repost */}
          <button onClick={handleRepost} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', borderRadius: 20, padding: '6px 12px',
            cursor: 'pointer', color: '#888', fontWeight: 600, fontSize: 13,
          }}>
            🔁 {post.repost_count}
          </button>

          {/* Share */}
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); toast.success('Link copied!') }} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', borderRadius: 20, padding: '6px 12px',
            cursor: 'pointer', color: '#888', fontWeight: 600, fontSize: 13,
          }}>
            📤
          </button>

          <div style={{ flex: 1 }} />

          {/* Bookmark */}
          <button onClick={toggleBookmark} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
            color: bookmarked ? '#D4A832' : '#ccc', padding: '4px 8px',
          }}>
            {bookmarked ? '🔖' : '🏷️'}
          </button>
        </div>
      </div>
    </div>
  )
}
