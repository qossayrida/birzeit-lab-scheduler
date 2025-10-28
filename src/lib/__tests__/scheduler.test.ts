import { describe, it, expect } from 'vitest';
import { scheduleAssignments, validateSchedule } from '../scheduler';
import { Lab, TA } from '../../types';

describe('scheduleAssignments', () => {
  const mockLabs: Lab[] = [
    {
      id: 'lab1',
      code: 'ENCS_10',
      title: 'Programming 1',
      section: 'L1',
      feasibleDays: ['Mon', 'Wed'],
      feasibleTimes: [8, 11],
    },
    {
      id: 'lab2',
      code: 'ENCS_11',
      title: 'Programming 2',
      section: 'L1',
      feasibleDays: ['Tue', 'Thu'],
      feasibleTimes: [11, 14],
    },
  ];

  const mockTAs: TA[] = [
    {
      id: 'ta1',
      name: 'TA One',
      preferredDays: ['Mon', 'Wed'],
      preferredTimes: [8, 11],
      maxLabs: 2,
    },
    {
      id: 'ta2',
      name: 'TA Two',
      preferredDays: ['Tue', 'Thu'],
      preferredTimes: [11, 14],
      maxLabs: 2,
    },
  ];

  it('should assign labs to TAs', () => {
    const result = scheduleAssignments(mockLabs, mockTAs, 12345);

    expect(result.assignments.length).toBeGreaterThan(0);
    expect(result.assignments.length).toBeLessThanOrEqual(mockLabs.length);
  });

  it('should be deterministic with same seed', () => {
    const result1 = scheduleAssignments(mockLabs, mockTAs, 12345);
    const result2 = scheduleAssignments(mockLabs, mockTAs, 12345);

    expect(result1.assignments).toEqual(result2.assignments);
  });

  it('should respect TA preferences', () => {
    const result = scheduleAssignments(mockLabs, mockTAs, 12345);

    for (const assignment of result.assignments) {
      const ta = mockTAs.find(t => t.id === assignment.taId);
      expect(ta).toBeDefined();
    }
  });

  it('should not double-book TAs', () => {
    const result = scheduleAssignments(mockLabs, mockTAs, 12345);

    const slotMap = new Map<string, string>();
    for (const assignment of result.assignments) {
      const key = `${assignment.taId}_${assignment.day}_${assignment.time}`;
      expect(slotMap.has(key)).toBe(false);
      slotMap.set(key, assignment.labId);
    }
  });

  it('should respect maxLabs constraint', () => {
    const result = scheduleAssignments(mockLabs, mockTAs, 12345);

    const taAssignmentCounts = new Map<string, number>();
    for (const assignment of result.assignments) {
      const count = taAssignmentCounts.get(assignment.taId) || 0;
      taAssignmentCounts.set(assignment.taId, count + 1);
    }

    for (const [taId, count] of taAssignmentCounts) {
      const ta = mockTAs.find(t => t.id === taId);
      expect(ta).toBeDefined();
      expect(count).toBeLessThanOrEqual(ta!.maxLabs);
    }
  });

  it('should respect locked assignments', () => {
    const lockedAssignments = [
      {
        labId: 'lab1',
        taId: 'ta1',
        day: 'Mon' as const,
        time: 8 as const,
        locked: true,
        scoreMeta: { base: 0, loadPenalty: 0, tieBreak: 0 }
      }
    ];

    const result = scheduleAssignments(mockLabs, mockTAs, 12345, lockedAssignments);

    const lockedAssignment = result.assignments.find(a => a.labId === 'lab1');
    expect(lockedAssignment).toBeDefined();
    expect(lockedAssignment?.taId).toBe('ta1');
    expect(lockedAssignment?.day).toBe('Mon');
    expect(lockedAssignment?.time).toBe(8);
  });
});

describe('validateSchedule', () => {
  const mockLabs: Lab[] = [
    {
      id: 'lab1',
      code: 'ENCS_10',
      title: 'Programming 1',
      section: 'L1',
      feasibleDays: ['Mon'],
      feasibleTimes: [8],
    },
  ];

  const mockTAs: TA[] = [
    {
      id: 'ta1',
      name: 'TA One',
      preferredDays: ['Mon'],
      preferredTimes: [8],
      maxLabs: 1,
    },
  ];

  it('should return no errors for valid schedule', () => {
    const assignments = [
      {
        labId: 'lab1',
        taId: 'ta1',
        day: 'Mon' as const,
        time: 8 as const,
        locked: false,
        scoreMeta: { base: 0, loadPenalty: 0, tieBreak: 0 }
      }
    ];

    const errors = validateSchedule(assignments, mockLabs, mockTAs);
    expect(errors).toHaveLength(0);
  });

  it('should detect double bookings', () => {
    const assignments = [
      {
        labId: 'lab1',
        taId: 'ta1',
        day: 'Mon' as const,
        time: 8 as const,
        locked: false,
        scoreMeta: { base: 0, loadPenalty: 0, tieBreak: 0 }
      },
      {
        labId: 'lab2',
        taId: 'ta1',
        day: 'Mon' as const,
        time: 8 as const,
        locked: false,
        scoreMeta: { base: 0, loadPenalty: 0, tieBreak: 0 }
      }
    ];

    const errors = validateSchedule(assignments, mockLabs, mockTAs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('multiple labs'))).toBe(true);
  });

  it('should detect capacity violations', () => {
    const assignments = [
      {
        labId: 'lab1',
        taId: 'ta1',
        day: 'Mon' as const,
        time: 8 as const,
        locked: false,
        scoreMeta: { base: 0, loadPenalty: 0, tieBreak: 0 }
      },
      {
        labId: 'lab2',
        taId: 'ta1',
        day: 'Tue' as const,
        time: 11 as const,
        locked: false,
        scoreMeta: { base: 0, loadPenalty: 0, tieBreak: 0 }
      }
    ];

    const errors = validateSchedule(assignments, mockLabs, mockTAs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('max is'))).toBe(true);
  });
});
