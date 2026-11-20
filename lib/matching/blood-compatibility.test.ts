import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BLOOD_GROUPS, type BloodGroup } from '../../types/common.type';
import {
  BLOOD_COMPATIBILITY,
  COOLDOWN_DAYS,
  DEFAULT_COLOMBO_COORDS,
  buildEligibleDonorNearSphereQuery,
  buildNearbyRequestsNearSphereQuery,
  calculateDistanceKm,
  ensureGeoIndexOnce,
  evaluateDonorDashboardEligibility,
  getCompatibleRequestBloodGroups,
  getCooldownCutoffDate,
  isDonorPastCooldown,
  mergeAndSortNearbyRequests,
  normalizeGeoCoordinates,
  resetGeoIndexCacheForTests,
} from './blood-compatibility';

const COLOMBO: [number, number] = [79.8612, 6.9271];
const DEHIWALA: [number, number] = [79.8653, 6.8511];
const MORATUWA: [number, number] = [79.8816, 6.773];
const KANDY: [number, number] = [80.6337, 7.2906];

describe('BLOOD_COMPATIBILITY', () => {
  it('defines the exact 8-way recipient-to-donor compatibility matrix', () => {
    expect(BLOOD_COMPATIBILITY).toEqual({
      'O-': ['O-'],
      'O+': ['O+', 'O-'],
      'A-': ['A-', 'O-'],
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'AB-': ['AB-', 'A-', 'B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    });
  });

  it('covers all 8 blood groups with no missing keys', () => {
    expect(Object.keys(BLOOD_COMPATIBILITY).sort()).toEqual(
      [...BLOOD_GROUPS].sort(),
    );
  });
});

describe('getCompatibleRequestBloodGroups', () => {
  it('returns all 8 blood groups for a universal O- donor', () => {
    expect(getCompatibleRequestBloodGroups('O-').sort()).toEqual(
      [...BLOOD_GROUPS].sort(),
    );
  });

  it('returns only AB+ for an AB+ donor', () => {
    expect(getCompatibleRequestBloodGroups('AB+')).toEqual(['AB+']);
  });

  it('returns compatible recipient groups for A+ and B- donors', () => {
    expect(getCompatibleRequestBloodGroups('A+').sort()).toEqual(['A+', 'AB+']);
    expect(getCompatibleRequestBloodGroups('B-').sort()).toEqual([
      'AB+',
      'AB-',
      'B+',
      'B-',
    ]);
  });

  it('returns an empty array when donor blood group is empty', () => {
    expect(getCompatibleRequestBloodGroups('')).toEqual([]);
  });

  it('maintains bidirectional equivalence across all 64 donor/recipient pairs', () => {
    for (const recipient of BLOOD_GROUPS) {
      for (const donor of BLOOD_GROUPS) {
        const forward = BLOOD_COMPATIBILITY[recipient].includes(donor);
        const inverse =
          getCompatibleRequestBloodGroups(donor).includes(recipient);
        expect(inverse).toBe(forward);
      }
    }
  });
});

describe('calculateDistanceKm', () => {
  it('returns 0 km for identical coordinates', () => {
    expect(calculateDistanceKm(COLOMBO, COLOMBO)).toBe(0);
  });

  it('calculates accurate Sri Lanka benchmark distances', () => {
    const colomboToDehiwala = calculateDistanceKm(COLOMBO, DEHIWALA);
    const colomboToMoratuwa = calculateDistanceKm(COLOMBO, MORATUWA);
    const colomboToKandy = calculateDistanceKm(COLOMBO, KANDY);

    expect(colomboToDehiwala).toBeGreaterThan(5);
    expect(colomboToDehiwala).toBeLessThan(10);
    expect(colomboToDehiwala).toBeCloseTo(8.5, 0);

    expect(colomboToMoratuwa).toBeGreaterThan(10);
    expect(colomboToMoratuwa).toBeLessThan(20);
    expect(colomboToMoratuwa).toBeCloseTo(17.3, 0);

    expect(colomboToKandy).toBeGreaterThan(20);
    expect(colomboToKandy).toBeCloseTo(94.4, 0);
  });

  it('is symmetric between point pairs', () => {
    expect(calculateDistanceKm(COLOMBO, KANDY)).toBe(
      calculateDistanceKm(KANDY, COLOMBO),
    );
  });
});

describe('120-day medical cooldown helpers', () => {
  const fixedNow = new Date('2026-11-19T12:00:00.000Z');
  const dayMs = 24 * 60 * 60 * 1000;

  it('uses a 120-day cooldown constant', () => {
    expect(COOLDOWN_DAYS).toBe(120);
  });

  it('computes the exact cutoff date 120 days prior to now', () => {
    const cutoff = getCooldownCutoffDate(fixedNow);
    expect(fixedNow.getTime() - cutoff.getTime()).toBe(120 * dayMs);
  });

  it('treats null and undefined lastDonationDate as eligible', () => {
    expect(isDonorPastCooldown(null, fixedNow)).toBe(true);
    expect(isDonorPastCooldown(undefined, fixedNow)).toBe(true);
  });

  it('excludes donations made 119 days ago and allows 120+ days ago', () => {
    const days119Ago = new Date(fixedNow.getTime() - 119 * dayMs);
    const days120Ago = new Date(fixedNow.getTime() - 120 * dayMs);
    const days130AgoIso = new Date(
      fixedNow.getTime() - 130 * dayMs,
    ).toISOString();

    expect(isDonorPastCooldown(days119Ago, fixedNow)).toBe(false);
    expect(isDonorPastCooldown(days120Ago, fixedNow)).toBe(true);
    expect(isDonorPastCooldown(days130AgoIso, fixedNow)).toBe(true);
  });

  it('returns false for invalid date strings', () => {
    expect(isDonorPastCooldown('not-a-date', fixedNow)).toBe(false);
  });
});

describe('$nearSphere query builders', () => {
  const fixedNow = new Date('2026-11-19T12:00:00.000Z');

  it('builds the eligible donor $nearSphere query with meters and cooldown filter', () => {
    const bloodGroup: BloodGroup = 'A+';
    const query = buildEligibleDonorNearSphereQuery({
      bloodGroup,
      hospitalCoordinates: COLOMBO,
      radiusKm: 10,
      now: fixedNow,
    });

    expect(query).toEqual({
      bloodGroup: { $in: ['A+', 'A-', 'O+', 'O-'] },
      isAvailable: true,
      isEligible: true,
      $or: [
        { lastDonationDate: null },
        { lastDonationDate: { $lte: getCooldownCutoffDate(fixedNow) } },
      ],
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: COLOMBO,
          },
          $maxDistance: 10_000,
        },
      },
    });
  });

  it('builds the nearby pending requests $nearSphere query using inverse compatibility', () => {
    const query = buildNearbyRequestsNearSphereQuery({
      donorBloodGroup: 'O-',
      donorCoordinates: DEHIWALA,
      radiusKm: 20,
    });

    expect(query.status).toBe('pending');
    expect(query.bloodGroup.$in.sort()).toEqual([...BLOOD_GROUPS].sort());
    expect(query.location).toEqual({
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: DEHIWALA,
        },
        $maxDistance: 20_000,
      },
    });
  });
});

describe('ensureGeoIndexOnce', () => {
  beforeEach(() => {
    resetGeoIndexCacheForTests();
  });

  it('executes createIndexes only once across concurrent and repeated calls', async () => {
    const createIndexes = vi.fn().mockResolvedValue(undefined);

    await Promise.all([
      ensureGeoIndexOnce('Donor', createIndexes),
      ensureGeoIndexOnce('Donor', createIndexes),
    ]);
    await ensureGeoIndexOnce('Donor', createIndexes);

    expect(createIndexes).toHaveBeenCalledTimes(1);
  });

  it('tracks index initialization independently per model key', async () => {
    const donorIndexes = vi.fn().mockResolvedValue(undefined);
    const requestIndexes = vi.fn().mockResolvedValue(undefined);

    await ensureGeoIndexOnce('Donor', donorIndexes);
    await ensureGeoIndexOnce('DonationRequest', requestIndexes);

    expect(donorIndexes).toHaveBeenCalledTimes(1);
    expect(requestIndexes).toHaveBeenCalledTimes(1);
  });

  it('evicts failed attempts from cache so a subsequent call can retry', async () => {
    const createIndexes = vi
      .fn()
      .mockRejectedValueOnce(new Error('transient db error'))
      .mockResolvedValueOnce(undefined);

    await expect(ensureGeoIndexOnce('Donor', createIndexes)).rejects.toThrow(
      'transient db error',
    );
    await expect(
      ensureGeoIndexOnce('Donor', createIndexes),
    ).resolves.toBeUndefined();

    expect(createIndexes).toHaveBeenCalledTimes(2);
  });
});

describe('mergeAndSortNearbyRequests & normalizeGeoCoordinates (Donor Dashboard)', () => {
  it('falls back to Colombo coordinates when location coordinates are missing or malformed', () => {
    expect(normalizeGeoCoordinates(null)).toEqual(DEFAULT_COLOMBO_COORDS);
    expect(normalizeGeoCoordinates([79.86])).toEqual(DEFAULT_COLOMBO_COORDS);
    expect(normalizeGeoCoordinates([Number.NaN, 6.9])).toEqual(
      DEFAULT_COLOMBO_COORDS,
    );
    expect(normalizeGeoCoordinates(DEHIWALA)).toEqual(DEHIWALA);
  });

  it('merges nearby and notified requests, deduplicates by _id, sorts nearest-first then newest-first, and enforces limit', () => {
    const nearby = [
      {
        _id: 'req-dehiwala',
        location: { coordinates: DEHIWALA },
        createdAt: '2026-11-19T08:00:00.000Z',
      },
      {
        _id: 'req-colombo-old',
        location: { coordinates: COLOMBO },
        createdAt: '2026-11-19T07:00:00.000Z',
      },
    ];

    const notified = [
      // Duplicate of nearby req-dehiwala
      {
        _id: 'req-dehiwala',
        location: { coordinates: DEHIWALA },
        createdAt: '2026-11-19T08:00:00.000Z',
      },
      // Equidistant to req-colombo-old, but newer -> must sort first
      {
        _id: 'req-colombo-new',
        location: { coordinates: COLOMBO },
        createdAt: '2026-11-19T09:00:00.000Z',
      },
      // Wider 20 km hospital broadcast outside donor's 10 km preference
      {
        _id: 'req-moratuwa',
        location: { coordinates: MORATUWA },
        createdAt: '2026-11-19T10:00:00.000Z',
      },
    ];

    const merged = mergeAndSortNearbyRequests(nearby, notified, COLOMBO, 3);

    expect(merged.map((item) => item.req._id)).toEqual([
      'req-colombo-new',
      'req-colombo-old',
      'req-dehiwala',
    ]);
    expect(merged[0].distanceKm).toBe(0);
    expect(merged[1].distanceKm).toBe(0);
    expect(merged[2].distanceKm).toBeCloseTo(8.5, 0);

    const mergedAll = mergeAndSortNearbyRequests(nearby, notified, COLOMBO, 10);
    expect(mergedAll).toHaveLength(4);
    expect(mergedAll[3].req._id).toBe('req-moratuwa');
    expect(mergedAll[3].distanceKm).toBeCloseTo(17.3, 0);
  });
});

describe('evaluateDonorDashboardEligibility (120-day cooldown & availability guard)', () => {
  const dayMs = 24 * 60 * 60 * 1000;
  const fixedNow = new Date('2026-11-20T10:00:00.000Z');

  it('blocks a donor who donated yesterday (Akila scenario: 2026-11-19 on 2026-11-20) and returns next eligible date', () => {
    const result = evaluateDonorDashboardEligibility(
      {
        bloodGroup: 'A+',
        isAvailable: true,
        isEligible: true,
        lastDonationDate: '2026-11-19T00:00:00.000Z',
      },
      fixedNow,
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('cooldown');
    expect(result.nextEligibleDate?.toISOString()).toBe(
      new Date(
        new Date('2026-11-19T00:00:00.000Z').getTime() + 120 * dayMs,
      ).toISOString(),
    );
  });

  it('enforces the exact 119-day vs 120-day cooldown boundary', () => {
    const at119Days = evaluateDonorDashboardEligibility(
      {
        bloodGroup: 'O-',
        isAvailable: true,
        isEligible: true,
        lastDonationDate: new Date(fixedNow.getTime() - 119 * dayMs),
      },
      fixedNow,
    );
    const at120Days = evaluateDonorDashboardEligibility(
      {
        bloodGroup: 'O-',
        isAvailable: true,
        isEligible: true,
        lastDonationDate: new Date(fixedNow.getTime() - 120 * dayMs),
      },
      fixedNow,
    );

    expect(at119Days.eligible).toBe(false);
    expect(at119Days.reason).toBe('cooldown');
    expect(at120Days).toEqual({
      eligible: true,
      reason: 'eligible',
      nextEligibleDate: null,
    });
  });

  it('blocks donors marked clinically ineligible, unavailable, or missing blood group', () => {
    expect(
      evaluateDonorDashboardEligibility(
        {
          bloodGroup: 'A+',
          isAvailable: true,
          isEligible: false,
          lastDonationDate: null,
        },
        fixedNow,
      ),
    ).toEqual({
      eligible: false,
      reason: 'ineligible',
      nextEligibleDate: null,
    });

    expect(
      evaluateDonorDashboardEligibility(
        {
          bloodGroup: 'A+',
          isAvailable: false,
          isEligible: true,
          lastDonationDate: null,
        },
        fixedNow,
      ),
    ).toEqual({
      eligible: false,
      reason: 'unavailable',
      nextEligibleDate: null,
    });

    expect(
      evaluateDonorDashboardEligibility(
        {
          bloodGroup: '',
          isAvailable: true,
          isEligible: true,
          lastDonationDate: null,
        },
        fixedNow,
      ),
    ).toEqual({
      eligible: false,
      reason: 'missing_blood_group',
      nextEligibleDate: null,
    });
  });

  it('allows normal eligible and available donors with no prior donation', () => {
    expect(
      evaluateDonorDashboardEligibility(
        {
          bloodGroup: 'A+',
          isAvailable: true,
          isEligible: true,
          lastDonationDate: null,
        },
        fixedNow,
      ),
    ).toEqual({
      eligible: true,
      reason: 'eligible',
      nextEligibleDate: null,
    });
  });
});
