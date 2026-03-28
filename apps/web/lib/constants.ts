export const APP_NAME = 'StreakFlow'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const NAV_ITEMS = [
  { href: '/today',      label: 'Today',       icon: '◈' },
  { href: '/habits',     label: 'Habits',       icon: '◉' },
  { href: '/analytics',  label: 'Analytics',    icon: '▦' },
  { href: '/routines',   label: 'Routines',     icon: '⊞' },
] as const

export const NAV_WORKSPACE = [
  { href: '/team',        label: 'Team Space',  icon: '⬡' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '◌' },
] as const

export const HABIT_ICONS = ['🔥','✍️','📚','🏃','🧘','💪','🎯','🎵','💻','🌿','☀️','🍎','💧','🛌','📝']

export const HABIT_COLORS = [
  '#FF6B1A', '#FF3D68', '#4FBEFF', '#2ECFA0',
  '#F5C842', '#A78BFA', '#34D399', '#FB7185',
]

export const PRIORITY_LABELS = {
  low:    { label: 'Low',    color: 'text-[#8A8796]' },
  medium: { label: 'Medium', color: 'text-gold' },
  high:   { label: 'High',   color: 'text-flame' },
} as const
