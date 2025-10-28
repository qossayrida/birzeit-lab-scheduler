export type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type SlotTime = 8 | 11 | 14; // 8:00, 11:00, 14:00

export interface Lab {
  id: string; // stable hash of code+section
  code: string; // e.g., ENCS_10
  title: string;
  section: string; // e.g., L1, L2
  instructorName?: string;
  feasibleDays: Day[]; // empty means "user must set"
  feasibleTimes: SlotTime[]; // subset of [8,11,14]
  lockedDay?: Day;
  lockedTime?: SlotTime;
}

export interface TA {
  id: string;
  name: string;
  preferredDays: Day[];
  preferredTimes: SlotTime[];
  maxLabs: number;
  seed?: number; // optional per-TA seed
}

export interface Assignment {
  labId: string;
  taId: string;
  day: Day;
  time: SlotTime;
  locked?: boolean;
  scoreMeta: { base: number; loadPenalty: number; tieBreak: number };
}

export interface UnassignedLab {
  lab: Lab;
  reason: string;
}

export interface AppState {
  schemaVersion: number;
  lastFetch: string | null;
  labs: Lab[];
  tas: TA[];
  globalSeed: number;
  assignments: Assignment[];
  unassignedLabs: UnassignedLab[];
  userEdits: {
    labs: Partial<Lab>[];
  };
}

export interface ScheduleResult {
  assignments: Assignment[];
  unassignedLabs: UnassignedLab[];
}
