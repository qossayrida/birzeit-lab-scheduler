import type { Lab, TA, Assignment, Day, SlotTime, ScheduleResult, UnassignedLab } from '../types';
import { SeededRandom } from './prng';

interface Slot {
  day: Day;
  time: SlotTime;
}


/**
 * Main scheduling algorithm
 * Uses seeded PRNG for reproducible results
 */
export function scheduleAssignments(
  labs: Lab[],
  tas: TA[],
  globalSeed: number,
  existingAssignments: Assignment[] = []
): ScheduleResult {
  const rng = new SeededRandom(globalSeed);
  const assignments: Assignment[] = [];
  const unassignedLabs: UnassignedLab[] = [];

  // Track TA assignments
  const taAssignments = new Map<string, Assignment[]>();
  tas.forEach(ta => taAssignments.set(ta.id, []));

  // Track slot occupancy (day_time_taId)
  const slotOccupancy = new Map<string, string>(); // key: "day_time_taId" -> labId

  // Process locked assignments first
  const lockedAssignments = existingAssignments.filter(a => a.locked);
  for (const assignment of lockedAssignments) {
    assignments.push(assignment);
    const taAssigns = taAssignments.get(assignment.taId) || [];
    taAssigns.push(assignment);
    taAssignments.set(assignment.taId, taAssigns);
    
    const slotKey = `${assignment.day}_${assignment.time}_${assignment.taId}`;
    slotOccupancy.set(slotKey, assignment.labId);
  }

  // Get labs that aren't locked
  const lockedLabIds = new Set(lockedAssignments.map(a => a.labId));
  const unassignedLabsList = labs.filter(lab => !lockedLabIds.has(lab.id));

  // Sort labs by difficulty (fewer feasible slots first)
  const sortedLabs = sortLabsByDifficulty(unassignedLabsList, rng);

  // Assign each lab
  for (const lab of sortedLabs) {
    const feasibleSlots = getFeasibleSlots(lab);

    if (feasibleSlots.length === 0) {
      unassignedLabs.push({
        lab,
        reason: 'No feasible time slots available'
      });
      continue;
    }

    // Find best TA for this lab
    const bestMatch = findBestTA(
      lab,
      feasibleSlots,
      tas,
      taAssignments,
      slotOccupancy,
      rng
    );

    if (!bestMatch) {
      unassignedLabs.push({
        lab,
        reason: 'No available TA found (all TAs are at capacity or have conflicts)'
      });
      continue;
    }

    // Create assignment
    const assignment: Assignment = {
      labId: lab.id,
      taId: bestMatch.ta.id,
      day: bestMatch.slot.day,
      time: bestMatch.slot.time,
      locked: false,
      scoreMeta: {
        base: bestMatch.baseScore,
        loadPenalty: bestMatch.loadPenalty,
        tieBreak: bestMatch.tieBreak
      }
    };

    assignments.push(assignment);
    const taAssigns = taAssignments.get(bestMatch.ta.id) || [];
    taAssigns.push(assignment);
    taAssignments.set(bestMatch.ta.id, taAssigns);

    const slotKey = `${bestMatch.slot.day}_${bestMatch.slot.time}_${bestMatch.ta.id}`;
    slotOccupancy.set(slotKey, lab.id);
  }

  return { assignments, unassignedLabs };
}

/**
 * Get all feasible slots for a lab
 */
function getFeasibleSlots(lab: Lab): Slot[] {
  if (lab.lockedDay && lab.lockedTime) {
    return [{ day: lab.lockedDay, time: lab.lockedTime }];
  }

  const slots: Slot[] = [];
  const days = lab.feasibleDays.length > 0 ? lab.feasibleDays : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'] as Day[];
  const times = lab.feasibleTimes.length > 0 ? lab.feasibleTimes : [8, 11, 14] as SlotTime[];

  for (const day of days) {
    for (const time of times) {
      slots.push({ day, time });
    }
  }

  return slots;
}

/**
 * Sort labs by difficulty (fewer feasible slots = harder to assign)
 */
function sortLabsByDifficulty(labs: Lab[], rng: SeededRandom): Lab[] {
  const labsWithScore = labs.map(lab => ({
    lab,
    slotCount: getFeasibleSlots(lab).length,
    tieBreak: rng.next()
  }));

  labsWithScore.sort((a, b) => {
    if (a.slotCount !== b.slotCount) {
      return a.slotCount - b.slotCount;
    }
    return a.tieBreak - b.tieBreak;
  });

  return labsWithScore.map(item => item.lab);
}

/**
 * Find best TA for a lab considering all feasible slots
 */
function findBestTA(
  lab: Lab,
  feasibleSlots: Slot[],
  tas: TA[],
  taAssignments: Map<string, Assignment[]>,
  slotOccupancy: Map<string, string>,
  rng: SeededRandom
): {
  ta: TA;
  slot: Slot;
  baseScore: number;
  loadPenalty: number;
  tieBreak: number;
} | null {
  let bestMatch: {
    ta: TA;
    slot: Slot;
    baseScore: number;
    loadPenalty: number;
    tieBreak: number;
    totalScore: number;
  } | null = null;

  for (const ta of tas) {
    const taRng = new SeededRandom(ta.seed || rng.nextInt(1, 1000000));
    const currentAssignments = taAssignments.get(ta.id) || [];

    // Check if TA is at capacity
    if (currentAssignments.length >= ta.maxLabs) {
      continue;
    }

    // Try each feasible slot
    for (const slot of feasibleSlots) {
      const slotKey = `${slot.day}_${slot.time}_${ta.id}`;

      // Check if slot is already occupied by this TA
      if (slotOccupancy.has(slotKey)) {
        continue;
      }

      // Calculate score
      const baseScore = calculateBaseScore(ta, slot);
      const loadPenalty = calculateLoadPenalty(currentAssignments.length, ta.maxLabs);
      const tieBreak = taRng.next() * 0.01; // Small random factor for tie-breaking
      const totalScore = baseScore - loadPenalty + tieBreak;

      if (!bestMatch || totalScore > bestMatch.totalScore) {
        bestMatch = {
          ta,
          slot,
          baseScore,
          loadPenalty,
          tieBreak,
          totalScore
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Calculate base score for TA preference match
 */
function calculateBaseScore(ta: TA, slot: Slot): number {
  let score = 0;

  if (ta.preferredDays.includes(slot.day)) {
    score += 2;
  }

  if (ta.preferredTimes.includes(slot.time)) {
    score += 2;
  }

  return score;
}

/**
 * Calculate load penalty (to balance assignments)
 */
function calculateLoadPenalty(assignedCount: number, maxLabs: number): number {
  if (maxLabs === 0) return 999; // Prevent division by zero
  return 0.5 * (assignedCount / maxLabs);
}

/**
 * Validate schedule for conflicts
 */
export function validateSchedule(
  assignments: Assignment[],
  labs: Lab[],
  tas: TA[]
): string[] {
  const errors: string[] = [];
  const taMap = new Map(tas.map(ta => [ta.id, ta]));

  // Check for double bookings
  const slotMap = new Map<string, Assignment[]>();
  
  for (const assignment of assignments) {
    const slotKey = `${assignment.day}_${assignment.time}_${assignment.taId}`;
    const existing = slotMap.get(slotKey) || [];
    existing.push(assignment);
    slotMap.set(slotKey, existing);

    if (existing.length > 1) {
      const ta = taMap.get(assignment.taId);
      errors.push(
        `TA ${ta?.name || assignment.taId} has multiple labs at ${assignment.day} ${assignment.time}`
      );
    }
  }

  // Check TA capacity
  const taAssignmentCounts = new Map<string, number>();
  for (const assignment of assignments) {
    const count = taAssignmentCounts.get(assignment.taId) || 0;
    taAssignmentCounts.set(assignment.taId, count + 1);
  }

  for (const [taId, count] of taAssignmentCounts) {
    const ta = taMap.get(taId);
    if (ta && count > ta.maxLabs) {
      errors.push(`TA ${ta.name} is assigned ${count} labs but max is ${ta.maxLabs}`);
    }
  }

  return errors;
}
