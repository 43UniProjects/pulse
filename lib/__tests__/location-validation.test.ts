import { describe, it, expect } from 'vitest';
import { locationCoordSchema } from '@/lib/geo';

describe('Location Coordinate Validation Schema (Zod Boundaries)', () => {
  it('should accept valid geographic coordinates', () => {
    const valid = { longitude: 79.8612, latitude: 6.9271 };
    const result = locationCoordSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should accept exact boundary coordinates (-180, -90, 180, 90, 0, 0)', () => {
    expect(
      locationCoordSchema.safeParse({ longitude: -180, latitude: -90 }).success,
    ).toBe(true);
    expect(
      locationCoordSchema.safeParse({ longitude: 180, latitude: 90 }).success,
    ).toBe(true);
    expect(
      locationCoordSchema.safeParse({ longitude: 0, latitude: 0 }).success,
    ).toBe(true);
  });

  it('should reject longitude out of bounds (> 180 or < -180)', () => {
    expect(
      locationCoordSchema.safeParse({ longitude: 180.1, latitude: 0 }).success,
    ).toBe(false);
    expect(
      locationCoordSchema.safeParse({ longitude: -180.5, latitude: 0 }).success,
    ).toBe(false);
  });

  it('should reject latitude out of bounds (> 90 or < -90)', () => {
    expect(
      locationCoordSchema.safeParse({ longitude: 0, latitude: 90.1 }).success,
    ).toBe(false);
    expect(
      locationCoordSchema.safeParse({ longitude: 0, latitude: -90.5 }).success,
    ).toBe(false);
  });

  it('should reject non-numeric values and missing fields', () => {
    expect(
      locationCoordSchema.safeParse({ longitude: '79.86', latitude: 6.92 })
        .success,
    ).toBe(false);
    expect(locationCoordSchema.safeParse({ longitude: 79.86 }).success).toBe(
      false,
    );
    expect(locationCoordSchema.safeParse({}).success).toBe(false);
  });
});
