import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function pluralize(count: number, word: string, plural?: string): string {
  return count === 1 ? `${count} ${word}` : `${count} ${plural ?? word + 's'}`
}

export function streakToNextMilestone(current: number): { next: number; daysAway: number } {
  const milestones = [7, 14, 21, 30, 50, 60, 75, 100, 150, 200, 250, 365]
  const next = milestones.find((m) => m > current) ?? current + 100
  return { next, daysAway: next - current }
}
