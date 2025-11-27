import { type ClassValue, clsx } from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getGameIcon(game: string): string {
  const icons: Record<string, string> = {
    valorant: '🎯',
    cs2: '🔫',
    r6: '🏰',
    apex: '⚡',
    league: '⚔️',
    overwatch: '🎮',
    fortnite: '🏗️',
    cod: '💣',
    other: '🎮',
  }
  return icons[game] || icons.other
}

export function getPeripheralIcon(category: string): string {
  const icons: Record<string, string> = {
    mouse: '🖱️',
    keyboard: '⌨️',
    mousepad: '📋',
    headset: '🎧',
    monitor: '🖥️',
    microphone: '🎤',
    controller: '🎮',
    chair: '💺',
    other: '🔧',
  }
  return icons[category] || icons.other
}
