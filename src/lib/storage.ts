import localforage from 'localforage';
import { AppState } from '../types';

const SCHEMA_VERSION = 1;
const STORE_KEY = 'appState@v1';

/**
 * Initialize storage
 */
export function initStorage() {
  localforage.config({
    name: 'BirzeitLabScheduler',
    version: 1.0,
    storeName: 'scheduler_data',
    description: 'TA Lab Scheduler persistent storage'
  });
}

/**
 * Load app state from IndexedDB
 */
export async function loadState(): Promise<AppState | null> {
  try {
    const state = await localforage.getItem<AppState>(STORE_KEY);
    
    if (!state) {
      return null;
    }

    // Check schema version
    if (state.schemaVersion !== SCHEMA_VERSION) {
      console.warn('Schema version mismatch, migrating...');
      return migrateState(state);
    }

    return state;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

/**
 * Save app state to IndexedDB
 */
export async function saveState(state: AppState): Promise<void> {
  try {
    await localforage.setItem(STORE_KEY, {
      ...state,
      schemaVersion: SCHEMA_VERSION
    });
  } catch (error) {
    console.error('Failed to save state:', error);
    throw error;
  }
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<void> {
  try {
    await localforage.clear();
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw error;
  }
}

/**
 * Migrate state from old schema to new
 */
function migrateState(oldState: any): AppState {
  // For now, just return a default state
  // In the future, implement actual migration logic
  console.warn('Migration not implemented, returning default state');
  return getDefaultState();
}

/**
 * Get default app state
 */
export function getDefaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastFetch: null,
    sourceUrl: 'https://ritaj.birzeit.edu/hemis/bu-courses-list?term=1251&bu=10759&new_page=1',
    rawHtmlCacheKey: null,
    labs: [],
    tas: [],
    globalSeed: Math.floor(Math.random() * 0x7fffffff),
    assignments: [],
    unassignedLabs: [],
    userEdits: {
      labs: []
    }
  };
}

/**
 * Export state as JSON
 */
export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Import state from JSON
 */
export function importState(json: string): AppState {
  const state = JSON.parse(json);
  
  // Validate required fields
  if (!state.schemaVersion || !state.labs || !state.tas) {
    throw new Error('Invalid state format');
  }

  return state;
}

/**
 * Check if data is stale (older than 7 days)
 */
export function isDataStale(lastFetch: string | null): boolean {
  if (!lastFetch) {
    return true;
  }

  const lastFetchDate = new Date(lastFetch);
  const now = new Date();
  const daysDiff = (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysDiff > 7;
}

/**
 * Cache HTML content
 */
export async function cacheHTML(url: string, html: string): Promise<string> {
  try {
    if ('caches' in window) {
      const cache = await caches.open('ritaj-html-cache');
      const response = new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
      await cache.put(url, response);
      return url;
    }
    return '';
  } catch (error) {
    console.error('Failed to cache HTML:', error);
    return '';
  }
}

/**
 * Get cached HTML content
 */
export async function getCachedHTML(url: string): Promise<string | null> {
  try {
    if ('caches' in window) {
      const cache = await caches.open('ritaj-html-cache');
      const response = await cache.match(url);
      if (response) {
        return await response.text();
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached HTML:', error);
    return null;
  }
}
