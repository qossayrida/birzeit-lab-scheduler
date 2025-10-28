import type { Lab, Day, SlotTime } from '../types';
import { hashString } from './prng';

/**
 * Parse HTML from Ritaj course list and extract ENCS labs
 */
export function parseRitajHTML(html: string): Lab[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const labs: Lab[] = [];

  // Try multiple selectors to find course rows
  const rows = doc.querySelectorAll('tr, .course-row, .course-item');

  rows.forEach((row) => {
    try {
      const lab = parseRow(row);
      if (lab) {
        labs.push(lab);
      }
    } catch (error) {
      console.warn('Failed to parse row:', error);
    }
  });

  return labs;
}

function parseRow(row: Element): Lab | null {
  // Extract text content
  const text = row.textContent || '';
  const cells = Array.from(row.querySelectorAll('td, .cell, span'));

  // Look for course code matching ENCS_1[0-5]
  const codeMatch = text.match(/ENCS[_\s]?1[0-5]/i);
  if (!codeMatch) {
    return null;
  }

  const code = codeMatch[0].replace(/\s/g, '_').toUpperCase();

  // Extract section (look for L1, L2, etc.)
  const sectionMatch = text.match(/L\d+/i);
  const section = sectionMatch ? sectionMatch[0].toUpperCase() : 'L1';

  // Extract title (usually after the code)
  let title = '';
  const titleMatch = text.match(/ENCS[_\s]?1[0-5]\s+([A-Za-z\s]+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else {
    // Try to find title in cells
    for (const cell of cells) {
      const cellText = cell.textContent?.trim() || '';
      if (cellText.length > 10 && !cellText.match(/ENCS|^\d+$/)) {
        title = cellText;
        break;
      }
    }
  }

  // Extract instructor name
  let instructorName: string | undefined;
  const instructorMatch = text.match(/(?:Dr\.|Prof\.|Mr\.|Ms\.)\s+([A-Za-z\s]+)/i);
  if (instructorMatch) {
    instructorName = instructorMatch[0].trim();
  }

  // Extract days and times
  const { days, times } = parseDaysAndTimes(text);

  // Generate stable ID
  const id = `${code}_${section}_${hashString(code + section)}`;

  return {
    id,
    code,
    title: title || `${code} Lab`,
    section,
    instructorName,
    feasibleDays: days,
    feasibleTimes: times,
  };
}

function parseDaysAndTimes(text: string): { days: Day[]; times: SlotTime[] } {
  const days: Day[] = [];
  const times: SlotTime[] = [];

  // Parse days
  const dayPatterns: [RegExp, Day][] = [
    [/\bSun(?:day)?\b/i, 'Sun'],
    [/\bMon(?:day)?\b/i, 'Mon'],
    [/\bTue(?:sday)?\b/i, 'Tue'],
    [/\bWed(?:nesday)?\b/i, 'Wed'],
    [/\bThu(?:rsday)?\b/i, 'Thu'],
    [/\bFri(?:day)?\b/i, 'Fri'],
    [/\bSat(?:urday)?\b/i, 'Sat'],
  ];

  for (const [pattern, day] of dayPatterns) {
    if (pattern.test(text)) {
      days.push(day);
    }
  }

  // Parse times (look for 8:00, 11:00, 14:00 or variations)
  if (/\b8:?00\b|\b8\s*AM\b/i.test(text)) {
    times.push(8);
  }
  if (/\b11:?00\b|\b11\s*AM\b/i.test(text)) {
    times.push(11);
  }
  if (/\b14:?00\b|\b2:?00\s*PM\b/i.test(text)) {
    times.push(14);
  }

  // If no specific times found, allow all times
  if (times.length === 0) {
    times.push(8, 11, 14);
  }

  // If no specific days found, allow all weekdays
  if (days.length === 0) {
    days.push('Sun', 'Mon', 'Tue', 'Wed', 'Thu');
  }

  return { days, times };
}

/**
 * Parse uploaded HTML file
 */
export async function parseHTMLFile(file: File): Promise<Lab[]> {
  const text = await file.text();
  return parseRitajHTML(text);
}

/**
 * Validate lab data
 */
export function validateLab(lab: Partial<Lab>): string[] {
  const errors: string[] = [];

  if (!lab.code || !lab.code.match(/^ENCS_1[0-5]$/)) {
    errors.push('Invalid course code');
  }

  if (!lab.section) {
    errors.push('Section is required');
  }

  if (!lab.title) {
    errors.push('Title is required');
  }

  return errors;
}
