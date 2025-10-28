import { create } from 'zustand';
import type { AppState, Lab, TA, Assignment } from '../types';
import { 
  loadState, 
  saveState, 
  getDefaultState, 
  clearAllData
} from '../lib/storage';
import { parseRitajHTML } from '../lib/parser';
import { scheduleAssignments } from '../lib/scheduler';
import { generateSeed } from '../lib/prng';
import { getCurrentTimestamp } from '../lib/dates';

interface StoreState extends AppState {
  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isScheduling: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  uploadHTML: (file: File) => Promise<void>;
  
  // TA management
  addTA: (ta: Omit<TA, 'id'>) => void;
  updateTA: (id: string, updates: Partial<TA>) => void;
  removeTA: (id: string) => void;
  
  // Lab management
  updateLab: (id: string, updates: Partial<Lab>) => void;
  lockLabSlot: (id: string, day: Lab['lockedDay'], time: Lab['lockedTime']) => void;
  
  // Scheduling
  runScheduler: () => void;
  setGlobalSeed: (seed: number) => void;
  randomizeGlobalSeed: () => void;
  
  // Assignment management
  lockAssignment: (labId: string, lock: boolean) => void;
  moveAssignment: (labId: string, taId: string, day: Assignment['day'], time: Assignment['time']) => void;
  
  // Data management
  exportData: () => string;
  importData: (json: string) => void;
  clearAll: () => Promise<void>;
  
  // Persistence
  persist: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  ...getDefaultState(),
  isLoading: false,
  isFetching: false,
  isScheduling: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const savedState = await loadState();
      if (savedState) {
        set({
          ...savedState,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false 
      });
    }
  },

  uploadHTML: async (file: File) => {
    set({ isFetching: true, error: null });
    
    try {
      const html = await file.text();
      const labs = parseRitajHTML(html);
      
      set({
        labs,
        lastFetch: getCurrentTimestamp(),
        isFetching: false,
        error: null
      });
      
      await get().persist();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to parse HTML file',
        isFetching: false
      });
    }
  },

  addTA: (ta: Omit<TA, 'id'>) => {
    const state = get();
    const newTA: TA = {
      ...ta,
      id: `ta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    set({ tas: [...state.tas, newTA] });
    get().persist();
  },

  updateTA: (id: string, updates: Partial<TA>) => {
    const state = get();
    const tas = state.tas.map(ta => 
      ta.id === id ? { ...ta, ...updates } : ta
    );
    
    set({ tas });
    get().persist();
  },

  removeTA: (id: string) => {
    const state = get();
    const tas = state.tas.filter(ta => ta.id !== id);
    const assignments = state.assignments.filter(a => a.taId !== id);
    
    set({ tas, assignments });
    get().persist();
  },

  updateLab: (id: string, updates: Partial<Lab>) => {
    const state = get();
    const labs = state.labs.map(lab =>
      lab.id === id ? { ...lab, ...updates } : lab
    );
    
    set({ labs });
    get().persist();
  },

  lockLabSlot: (id: string, day: Lab['lockedDay'], time: Lab['lockedTime']) => {
    const state = get();
    const labs = state.labs.map(lab =>
      lab.id === id ? { ...lab, lockedDay: day, lockedTime: time } : lab
    );
    
    set({ labs });
    get().persist();
  },

  runScheduler: () => {
    const state = get();
    set({ isScheduling: true, error: null });
    
    try {
      const result = scheduleAssignments(
        state.labs,
        state.tas,
        state.globalSeed,
        state.assignments.filter(a => a.locked)
      );
      
      set({
        assignments: result.assignments,
        unassignedLabs: result.unassignedLabs,
        isScheduling: false
      });
      
      get().persist();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Scheduling failed',
        isScheduling: false
      });
    }
  },

  setGlobalSeed: (seed: number) => {
    set({ globalSeed: seed });
    get().persist();
  },

  randomizeGlobalSeed: () => {
    set({ globalSeed: generateSeed() });
    get().persist();
  },

  lockAssignment: (labId: string, lock: boolean) => {
    const state = get();
    const assignments = state.assignments.map(a =>
      a.labId === labId ? { ...a, locked: lock } : a
    );
    
    set({ assignments });
    get().persist();
  },

  moveAssignment: (labId: string, taId: string, day: Assignment['day'], time: Assignment['time']) => {
    const state = get();
    const assignments = state.assignments.map(a =>
      a.labId === labId 
        ? { ...a, taId, day, time, locked: true }
        : a
    );
    
    set({ assignments });
    get().persist();
  },

  exportData: () => {
    const state = get();
    const exportData = {
      schemaVersion: state.schemaVersion,
      lastFetch: state.lastFetch,
      labs: state.labs,
      tas: state.tas,
      globalSeed: state.globalSeed,
      assignments: state.assignments,
      unassignedLabs: state.unassignedLabs
    };
    
    return JSON.stringify(exportData, null, 2);
  },

  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      
      set({
        schemaVersion: data.schemaVersion || 1,
        lastFetch: data.lastFetch,
        labs: data.labs || [],
        tas: data.tas || [],
        globalSeed: data.globalSeed || generateSeed(),
        assignments: data.assignments || [],
        unassignedLabs: data.unassignedLabs || [],
        error: null
      });
      
      get().persist();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to import data'
      });
    }
  },

  clearAll: async () => {
    try {
      await clearAllData();
      set({
        ...getDefaultState(),
        error: null
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear data'
      });
    }
  },

  persist: async () => {
    const state = get();
    try {
      await saveState({
        schemaVersion: state.schemaVersion,
        lastFetch: state.lastFetch,
        labs: state.labs,
        tas: state.tas,
        globalSeed: state.globalSeed,
        assignments: state.assignments,
        unassignedLabs: state.unassignedLabs,
        userEdits: state.userEdits
      });
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }
}));
