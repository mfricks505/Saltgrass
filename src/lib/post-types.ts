// src/lib/post-types.ts
// The Board's post types — shared config used by the feed, filters, and composer.

export interface PostType {
  id: string
  label: string
  icon: string
  color: string
  placeholder: string
  hasConditions?: boolean   // can tag Rundown conditions
  hasRecipe?: boolean       // shows recipe fields
  hasPhoto?: boolean
}

export const POST_TYPES: PostType[] = [
  {
    id: 'report', label: 'Report', icon: '🎣', color: '#4A8EC2',
    placeholder: "What'd you get into? Where, when, what they were biting...",
    hasConditions: true, hasPhoto: true,
  },
  {
    id: 'question', label: 'Question', icon: '❓', color: '#C8922A',
    placeholder: 'Ask the community — gear, spots, techniques, anything...',
    hasPhoto: true,
  },
  {
    id: 'gear', label: 'Gear', icon: '⚙️', color: '#7AA86A',
    placeholder: 'Gear talk — what works, what to avoid, recommendations...',
    hasPhoto: true,
  },
  {
    id: 'alert', label: 'Alert', icon: '⚠️', color: '#E07A4A',
    placeholder: 'Heads up — ramp closure, red tide, hazard, closure...',
    hasPhoto: true,
  },
  {
    id: 'recipe', label: 'Recipe', icon: '🍳', color: '#D4982E',
    placeholder: 'Share how you cook it up...',
    hasPhoto: true, hasRecipe: true,
  },
  {
    id: 'discussion', label: 'Discussion', icon: '💬', color: '#8A866E',
    placeholder: "What's on your mind?",
    hasPhoto: true,
  },
]

export const getPostType = (id: string) => POST_TYPES.find(t => t.id === id) ?? POST_TYPES[0]
