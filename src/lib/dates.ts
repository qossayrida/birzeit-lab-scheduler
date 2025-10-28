import type { Day, SlotTime } from '../types';

/**
 * Format time slot for display
 */
export function formatTime(time: SlotTime): string {
  return `${time}:00`;
}

/**
 * Format day for display
 */
export function formatDay(day: Day): string {
  return day;
}

/**
 * Get all available days
 */
export function getAllDays(): Day[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

/**
 * Get all available time slots
 */
export function getAllTimes(): SlotTime[] {
  return [8, 11, 14];
}

/**
 * Get weekdays only
 */
export function getWeekdays(): Day[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
