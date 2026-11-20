import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, shouldSyncLocation } from '../geo';

describe('Haversine Geolocation Utility (lib/geo.ts)', () => {
  const colombo = { latitude: 6.9271, longitude: 79.8612 };
  const kandy = { latitude: 7.2906, longitude: 80.6337 };

  describe('calculateHaversineDistance', () => {
    it('should return 0 meters for identical coordinates', () => {
      const distance = calculateHaversineDistance(colombo, colombo);
      expect(distance).toBe(0);
    });

    it('should calculate accurate distance between Colombo and Kandy (~95 km)', () => {
      const distance = calculateHaversineDistance(colombo, kandy);
      // Distance is approximately 94.5 - 95.5 km
      expect(distance).toBeGreaterThan(94000);
      expect(distance).toBeLessThan(96000);
    });

    it('should be symmetric: distance(A, B) equals distance(B, A)', () => {
      const distAB = calculateHaversineDistance(colombo, kandy);
      const distBA = calculateHaversineDistance(kandy, colombo);
      expect(distAB).toBeCloseTo(distBA, 5);
    });
  });

  describe('shouldSyncLocation (Battery-saving Throttling)', () => {
    const baseCoords = { latitude: 6.9271, longitude: 79.8612 };
    // Approximately 250m north from base
    const movedOver200m = { latitude: 6.9294, longitude: 79.8612 };
    // Approximately 50m north from base
    const movedUnder200m = { latitude: 6.9275, longitude: 79.8612 };

    it('should return true if never synced before', () => {
      expect(shouldSyncLocation(baseCoords, null, null)).toBe(true);
      expect(shouldSyncLocation(baseCoords, baseCoords, null)).toBe(true);
      expect(shouldSyncLocation(baseCoords, null, new Date())).toBe(true);
    });

    it('should return false if moved less than 200m and under 15 minutes elapsed', () => {
      const recentTime = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
      const shouldSync = shouldSyncLocation(
        movedUnder200m,
        baseCoords,
        recentTime,
      );
      expect(shouldSync).toBe(false);
    });

    it('should return true if moved over 200m even if under 15 minutes elapsed', () => {
      const recentTime = new Date(Date.now() - 2 * 60 * 1000); // 2 min ago
      const shouldSync = shouldSyncLocation(
        movedOver200m,
        baseCoords,
        recentTime,
      );
      expect(shouldSync).toBe(true);
    });

    it('should return true if 15 minutes have elapsed even with zero movement', () => {
      const oldTime = new Date(Date.now() - 16 * 60 * 1000); // 16 min ago
      const shouldSync = shouldSyncLocation(baseCoords, baseCoords, oldTime);
      expect(shouldSync).toBe(true);
    });
  });
});
