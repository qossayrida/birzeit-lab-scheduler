import { create } from 'zustand';
import type { AppState, Lab, TA, Assignment } from '../types';
import { 
  loadState, 
  saveState, 
  getDefaultState, 
  clearAllData,
  cacheHTML,
  getCachedHTML 
} from '../lib/storage';
import { parseRitajHTML } from '../lib/parser';
import { scheduleAssignments } from '../lib/scheduler';
import { generateSeed } from '../lib/prng';
import { getCurrentTimestamp } from '../lib/dates';

const STATIC_PROXY_CACHE: Record<string, string> = {
  'term=1251&bu=10759&new_page=1': 'proxy-cache/ritaj-1251-10759.html'
};

function normalizeRitajQuery(targetUrl: string): string | null {
  try {
    const parsed = new URL(targetUrl);

    if (parsed.hostname !== 'ritaj.birzeit.edu') {
      return null;
    }

    const term = parsed.searchParams.get('term');
    const bu = parsed.searchParams.get('bu');
    const newPage = parsed.searchParams.get('new_page') || '1';

    if (!term || !bu) {
      return null;
    }

    return `term=${term}&bu=${bu}&new_page=${newPage}`;
  } catch {
    return null;
  }
}

function resolveStaticProxyUrl(targetUrl: string): string | null {
  const key = normalizeRitajQuery(targetUrl);
  if (!key) {
    return null;
  }

  const assetPath = STATIC_PROXY_CACHE[key];
  if (!assetPath) {
    return null;
  }

  const base = import.meta.env.BASE_URL || '/';
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const prefix = trimmedBase === '/' ? '' : trimmedBase;

  return `${prefix}/${assetPath}`.replace(/\/{2,}/g, '/');
}

interface StoreState extends AppState {
  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isScheduling: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  setSourceUrl: (url: string) => void;
  fetchAndParseLabs: (url?: string) => Promise<void>;
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

  setSourceUrl: (url: string) => {
    set({ sourceUrl: url });
    get().persist();
  },

  fetchAndParseLabs: async (url?: string) => {
    const state = get();
    const targetUrl = url || state.sourceUrl;
    const staticProxyUrl = resolveStaticProxyUrl(targetUrl);
    const shouldPreferStatic =
      typeof window !== 'undefined' &&
      !!staticProxyUrl &&
      (window.location.hostname.endsWith('.github.io') ||
        window.location.hostname === 'github.io');
    
    set({ isFetching: true, error: null });
    
    try {
      let html: string | null = null;
      let lastError: unknown = null;
      
      if (shouldPreferStatic && staticProxyUrl) {
        try {
          const response = await fetch(staticProxyUrl, { cache: 'no-cache' });
          if (!response.ok) {
            throw new Error(`Static proxy returned status ${response.status}`);
          }
          html = await response.text();
          console.info(`Loaded labs data from static proxy cache at ${staticProxyUrl}`);
        } catch (staticError) {
          lastError = staticError;
          console.warn('Static proxy preferred fetch failed, falling back to proxy:', staticError);
        }
      }
      
      // Attempt proxy fetch first
      if (!html) {
        try {
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error(`Proxy request failed (${response.status})`);
          }
          
          html = await response.text();
        } catch (proxyError) {
          lastError = proxyError;
          console.warn('Proxy fetch failed:', proxyError);
        }
      }

      // Direct fetch fallback (will usually fail with CORS when hosted on GitHub Pages)
      if (!html) {
        try {
          const response = await fetch(targetUrl);
          html = await response.text();
        } catch (directError) {
          lastError = directError;
          console.warn('Direct fetch failed (expected on browsers due to CORS):', directError);
        }
      }

      // Static proxy cache fallback if we didn't already try it (non GitHub hosts)
      if (!html && staticProxyUrl && !shouldPreferStatic) {
        try {
          const response = await fetch(staticProxyUrl, { cache: 'no-cache' });
          if (!response.ok) {
            throw new Error(`Static proxy returned status ${response.status}`);
          }
          html = await response.text();
          console.info(`Loaded labs data from static proxy cache at ${staticProxyUrl}`);
        } catch (staticError) {
          lastError = staticError;
          console.error('Static proxy cache fetch failed:', staticError);
        }
      }

      if (!html) {
        const message = lastError instanceof Error ? lastError.message : 'Failed to fetch labs data';
        throw new Error(message);
      }
      
      // Cache the HTML
      const cacheKey = await cacheHTML(targetUrl, html);
      
      // Parse labs
      const labs = parseRitajHTML(html);
      
      set({
        labs,
        lastFetch: getCurrentTimestamp(),
        rawHtmlCacheKey: cacheKey,
        isFetching: false,
        error: null
      });
      
      await get().persist();
    } catch (error) {
      // Try to use cached data
      const cachedHTML = await getCachedHTML(targetUrl);
      if (cachedHTML) {
        const labs = parseRitajHTML(cachedHTML);
        set({
          labs,
          isFetching: false,
          error: 'Using cached data (network unavailable)'
        });
      } else {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch labs. Please upload HTML manually.',
          isFetching: false
        });
      }
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
      sourceUrl: state.sourceUrl,
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
        sourceUrl: data.sourceUrl,
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
        sourceUrl: state.sourceUrl,
        rawHtmlCacheKey: state.rawHtmlCacheKey,
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
