import type { Lab, Day, SlotTime } from '../types';
import { hashString } from './prng';

/**
 * Parse HTML from Ritaj course list and extract ENCS labs
 */
export function parseRitajHTML(html: string): Lab[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const labs: Lab[] = [];

  // Look for course links with data-course-id attributes
  const courseLinks = doc.querySelectorAll('a[data-course-id]');

  courseLinks.forEach((link) => {
    try {
      const lab = parseCourseLink(link);
      if (lab) {
        labs.push(lab);
      }
    } catch (error) {
      console.warn('Failed to parse course:', error);
    }
  });

  return labs;
}

function parseCourseLink(link: Element): Lab | null {
  // Get course ID from data attribute
  const courseId = link.getAttribute('data-course-id');
  if (!courseId) return null;

  // Extract course code from data-course-id (format: cid_ENCSXXXX)
  const codeMatch = courseId.match(/cid_ENCS(\d{4})/);
  if (!codeMatch) return null;

  const fullCode = `ENCS${codeMatch[1]}`;
  
  // Filter: only courses where second digit is 1 (ENCS[0-9]1[0-9]{2})
  if (!/^ENCS[0-9]1[0-9]{2}$/.test(fullCode)) {
    return null;
  }

  // Get course name from data attribute
  const courseName = link.getAttribute('data-course-name') || '';

  // Find the code and title in the link's child elements
  const codeSpan = link.querySelector('span');
  const titleDiv = link.querySelector('.title');
  
  const code = codeSpan?.textContent?.trim() || fullCode;
  const title = titleDiv?.textContent?.trim() || courseName || `${code} Lab`;

  // Extract section info from the collapse content (if available)
  // For now, we'll set default section as L1
  const section = 'L1';

  // Get the collapse target to find more details
  const collapseTarget = link.getAttribute('href');
  let instructorName: string | undefined;
  const { days, times } = { days: [] as Day[], times: [8, 11, 14] as SlotTime[] };

  // If we can find the collapse content, parse it for more details
  if (collapseTarget) {
    const collapseId = collapseTarget.replace('#', '');
    const collapseContent = link.ownerDocument?.getElementById(collapseId);
    if (collapseContent) {
      const collapseText = collapseContent.textContent || '';
      
      // Extract instructor
      const instructorMatch = collapseText.match(/(?:Dr\.|Prof\.|Mr\.|Ms\.|د\.|أ\.)\s*([^\n\r]+)/i);
      if (instructorMatch) {
        instructorName = instructorMatch[0].trim();
      }

      // Extract days and times from collapse content
      const parsedDaysAndTimes = parseDaysAndTimes(collapseText);
      days.push(...parsedDaysAndTimes.days);
      times.length = 0;
      times.push(...parsedDaysAndTimes.times);
    }
  }

  // If no days found, default to weekdays
  if (days.length === 0) {
    days.push('Sun', 'Mon', 'Tue', 'Wed', 'Thu');
  }

  // Generate stable ID
  const id = `${code}_${section}_${hashString(code + section)}`;

  return {
    id,
    code,
    title,
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
