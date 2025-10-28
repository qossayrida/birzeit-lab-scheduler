import type { Lab, Day, SlotTime } from '../types';
import { hashString } from './prng';

const TARGET_CODE_REGEX = /^ENCS[0-9]1[0-9]{2}$/;
const DEFAULT_DAYS: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const ALLOWED_SLOTS: SlotTime[] = [8, 11, 14];

const DAY_TOKEN_MAP: Record<string, Day> = {
  S: 'Sun',
  SU: 'Sun',
  SUN: 'Sun',
  U: 'Sun',
  M: 'Mon',
  MON: 'Mon',
  T: 'Tue',
  TU: 'Tue',
  TUE: 'Tue',
  TUES: 'Tue',
  W: 'Wed',
  WED: 'Wed',
  WEDS: 'Wed',
  R: 'Thu',
  TH: 'Thu',
  THU: 'Thu',
  THUR: 'Thu',
  THURS: 'Thu',
  H: 'Thu',
  F: 'Fri',
  FRI: 'Fri',
  SA: 'Sat',
  SAT: 'Sat'
};

/**
 * Parse HTML from Ritaj course list and extract ENCS lab sections
 */
export function parseRitajHTML(html: string): Lab[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const labs: Lab[] = [];

  const courseLinks = doc.querySelectorAll('a[data-course-id]');

  courseLinks.forEach((link) => {
    try {
      const courseLabs = parseCourseSections(link);
      if (courseLabs.length > 0) {
        labs.push(...courseLabs);
      }
    } catch (error) {
      console.warn('Failed to parse course:', error);
    }
  });

  return labs;
}

function parseCourseSections(link: Element): Lab[] {
  const labs: Lab[] = [];
  const courseId = link.getAttribute('data-course-id');
  if (!courseId) {
    return labs;
  }

  const codeMatch = courseId.match(/cid_ENCS(\d{4})/);
  if (!codeMatch) {
    return labs;
  }

  const courseCode = `ENCS${codeMatch[1]}`;
  if (!TARGET_CODE_REGEX.test(courseCode)) {
    return labs;
  }

  const courseName = normalizeWhitespace(link.getAttribute('data-course-name') || '');
  const codeSpan = link.querySelector('span');
  const titleDiv = link.querySelector('.title');

  const code = normalizeWhitespace(codeSpan?.textContent || '') || courseCode;
  const title = normalizeWhitespace(titleDiv?.textContent || '') || courseName || `${code} Lab`;

  const collapseContent = getCollapseContent(link);

  if (collapseContent) {
    const rows = Array.from(collapseContent.querySelectorAll('table tbody tr'));
    rows.forEach((row, index) => {
      const lab = parseSectionRow(row, code, title, index);
      if (lab) {
        labs.push(lab);
      }
    });
  }

  if (labs.length === 0) {
    const fallback = createFallbackLab(collapseContent, code, title);
    if (fallback) {
      labs.push(fallback);
    }
  }

  return labs;
}

function parseSectionRow(row: Element, code: string, title: string, index: number): Lab | null {
  const cells = Array.from(row.querySelectorAll('td'));
  if (cells.length === 0) {
    return null;
  }

  const rawSection = normalizeWhitespace(cells[1]?.textContent || '') || String(index + 1);
  const sanitizedSection = rawSection.replace(/\s+/g, '');
  const section = sanitizedSection.startsWith('L') ? sanitizedSection : `L${sanitizedSection}`;

  const instructorText = normalizeWhitespace(cells[0]?.textContent || '');
  const instructorName = instructorText || undefined;

  const dayText = normalizeWhitespace(row.querySelector('.date')?.textContent || '');
  const days = parseDayTokens(dayText);

  const timeText = normalizeWhitespace(row.querySelector('.time')?.textContent || '');
  const time = parseTimeSlot(timeText);

  if (!time) {
    console.warn(`Skipping ${code} ${section}: unsupported time "${timeText}"`);
    return null;
  }

  const feasibleDays = days.length > 0 ? days : [...DEFAULT_DAYS];
  const lockedDay = days.length === 1 ? days[0] : undefined;

  const idSeed = `${code}|${section}|${time}|${feasibleDays.join(',')}`;

  return {
    id: `${code}_${section}_${hashString(idSeed)}`,
    code,
    title,
    section,
    instructorName,
    feasibleDays,
    feasibleTimes: [time],
    lockedDay,
    lockedTime: time
  };
}

function createFallbackLab(
  collapseContent: Element | null,
  code: string,
  title: string
): Lab | null {
  let instructorName: string | undefined;
  let days: Day[] = [...DEFAULT_DAYS];
  let times: SlotTime[] = [...ALLOWED_SLOTS];

  if (collapseContent) {
    const collapseText = collapseContent.textContent || '';
    const parsed = parseDaysAndTimes(collapseText);
    if (parsed.days.length > 0) {
      days = parsed.days;
    }
    if (parsed.times.length > 0) {
      times = parsed.times;
    }
    instructorName = extractInstructor(collapseText) || undefined;
  }

  const section = 'L1';

  return {
    id: `${code}_${section}_${hashString(code + section)}`,
    code,
    title,
    section,
    instructorName,
    feasibleDays: days,
    feasibleTimes: times
  };
}

function getCollapseContent(link: Element): Element | null {
  const rawTarget = link.getAttribute('href');
  if (!rawTarget) {
    return null;
  }

  const hashIndex = rawTarget.lastIndexOf('#');
  if (hashIndex === -1 || hashIndex === rawTarget.length - 1) {
    return null;
  }

  const collapseId = rawTarget.slice(hashIndex + 1);
  return link.ownerDocument?.getElementById(collapseId) ?? null;
}

function parseDayTokens(text: string): Day[] {
  if (!text) {
    return [];
  }

  const tokens = text
    .split(/[^A-Za-z]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);

  const days: Day[] = [];
  tokens.forEach((token) => {
    const mapped = DAY_TOKEN_MAP[token];
    if (mapped && !days.includes(mapped)) {
      days.push(mapped);
    }
  });

  return days;
}

function parseTimeSlot(text: string): SlotTime | null {
  if (!text) {
    return null;
  }

  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  const hour = parseInt(match[1], 10);
  if (ALLOWED_SLOTS.includes(hour as SlotTime)) {
    return hour as SlotTime;
  }

  return null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function extractInstructor(text: string): string | null {
  const match = text.match(/(?:Dr\.|Prof\.|Mr\.|Ms\.)\s*([^\n\r]+)/i);
  return match ? normalizeWhitespace(match[0]) : null;
}

function parseDaysAndTimes(text: string): { days: Day[]; times: SlotTime[] } {
  const days: Day[] = [];
  const times: SlotTime[] = [];

  const dayPatterns: [RegExp, Day][] = [
    [/\bSun(?:day)?\b/i, 'Sun'],
    [/\bMon(?:day)?\b/i, 'Mon'],
    [/\bTue(?:sday)?\b/i, 'Tue'],
    [/\bWed(?:nesday)?\b/i, 'Wed'],
    [/\bThu(?:rsday)?\b/i, 'Thu'],
    [/\bFri(?:day)?\b/i, 'Fri'],
    [/\bSat(?:urday)?\b/i, 'Sat']
  ];

  for (const [pattern, day] of dayPatterns) {
    if (pattern.test(text)) {
      days.push(day);
    }
  }

  ALLOWED_SLOTS.forEach((slot) => {
    const pattern = new RegExp(`\\b${slot}:?00\\b`, 'i');
    if (pattern.test(text)) {
      times.push(slot);
    }
  });

  if (times.length === 0) {
    times.push(...ALLOWED_SLOTS);
  }

  if (days.length === 0) {
    days.push(...DEFAULT_DAYS);
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

  if (!lab.code || !/^ENCS\d{4}$/.test(lab.code)) {
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
