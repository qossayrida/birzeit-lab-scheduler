import { describe, it, expect } from 'vitest';
import { SeededRandom, generateSeed, hashString } from '../prng';

describe('SeededRandom', () => {
  it('should generate deterministic random numbers', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());

    expect(values1).toEqual(values2);
  });

  it('should generate different sequences for different seeds', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(54321);

    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());

    expect(values1).not.toEqual(values2);
  });

  it('should generate numbers in range [0, 1)', () => {
    const rng = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should generate integers in specified range', () => {
    const rng = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('should shuffle array deterministically', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    const shuffled1 = rng1.shuffle(arr);
    const shuffled2 = rng2.shuffle(arr);

    expect(shuffled1).toEqual(shuffled2);
    expect(shuffled1).not.toEqual(arr); // Should be different from original
    expect(shuffled1.sort()).toEqual(arr.sort()); // Should contain same elements
  });
});

describe('hashString', () => {
  it('should generate consistent hash for same string', () => {
    const hash1 = hashString('test');
    const hash2 = hashString('test');

    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different strings', () => {
    const hash1 = hashString('test1');
    const hash2 = hashString('test2');

    expect(hash1).not.toBe(hash2);
  });

  it('should generate positive integers', () => {
    const hash = hashString('test');

    expect(hash).toBeGreaterThan(0);
    expect(Number.isInteger(hash)).toBe(true);
  });
});

describe('generateSeed', () => {
  it('should generate positive integers', () => {
    const seed = generateSeed();

    expect(seed).toBeGreaterThan(0);
    expect(Number.isInteger(seed)).toBe(true);
  });

  it('should generate different seeds', () => {
    const seeds = Array.from({ length: 10 }, () => generateSeed());
    const uniqueSeeds = new Set(seeds);

    expect(uniqueSeeds.size).toBeGreaterThan(1);
  });
});
