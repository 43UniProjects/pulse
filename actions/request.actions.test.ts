import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockValidateRoleAccess = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockRevalidatePath = vi.fn();
const mockDonorCreateIndexes = vi.fn();
const mockDonorFindLean = vi.fn();
const mockDonorFind = vi.fn((...args: unknown[]) => {
  void args;
  return { lean: mockDonorFindLean };
});
const mockHospitalFindByIdLean = vi.fn();
const mockHospitalFindById = vi.fn((...args: unknown[]) => {
  void args;
  return { lean: mockHospitalFindByIdLean };
});
const mockHospitalFindByIdAndUpdate = vi.fn();
const mockDonationRequestCreate = vi.fn();
const mockDispatchPushAlerts = vi.fn();
const mockDispatchEmergencyEmailAlerts = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock('../lib/auth/guard', () => ({
  validateRoleAccess: (...args: unknown[]) => mockValidateRoleAccess(...args),
}));

vi.mock('../lib/db/connect', () => ({
  connectToDatabase: (...args: unknown[]) => mockConnectToDatabase(...args),
}));

vi.mock('../lib/models/donor.model', () => ({
  Donor: {
    createIndexes: (...args: unknown[]) => mockDonorCreateIndexes(...args),
    find: (...args: unknown[]) => mockDonorFind(...args),
  },
}));

vi.mock('../lib/models/hospital.model', () => ({
  Hospital: {
    findById: (...args: unknown[]) => mockHospitalFindById(...args),
    findByIdAndUpdate: (...args: unknown[]) =>
      mockHospitalFindByIdAndUpdate(...args),
  },
}));

vi.mock('../lib/models/donation-request.model', () => ({
  DonationRequest: {
    create: (...args: unknown[]) => mockDonationRequestCreate(...args),
  },
}));

vi.mock('../lib/notifications/push-alert', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../lib/notifications/push-alert')>();
  return {
    ...actual,
    dispatchPushAlerts: (...args: unknown[]) => mockDispatchPushAlerts(...args),
  };
});

vi.mock('../lib/notifications/email-alert', () => ({
  dispatchEmergencyEmailAlerts: (...args: unknown[]) =>
    mockDispatchEmergencyEmailAlerts(...args),
}));

import { createDonationRequest } from './request.actions';
import { resetGeoIndexCacheForTests } from '../lib/matching/blood-compatibility';

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

const INITIAL_STATE = { success: false };

beforeEach(() => {
  vi.clearAllMocks();
  resetGeoIndexCacheForTests();
  mockValidateRoleAccess.mockResolvedValue({
    user: { id: 'hospital-1', name: 'National Hospital Colombo' },
  });
  mockConnectToDatabase.mockResolvedValue({});
  mockDonorCreateIndexes.mockResolvedValue(undefined);
  mockHospitalFindByIdLean.mockResolvedValue({
    _id: 'hospital-1',
    name: 'National Hospital Colombo',
    address: 'Regent Street, Colombo 08',
    hotline: '+94 11 269 1111',
    location: { type: 'Point', coordinates: [79.8612, 6.9271] },
  });
  mockHospitalFindByIdAndUpdate.mockResolvedValue({});
});

describe('createDonationRequest server action', () => {
  it('propagates NEXT_REDIRECT thrown by validateRoleAccess without catching it', async () => {
    const redirectError = new Error('NEXT_REDIRECT');
    mockValidateRoleAccess.mockRejectedValueOnce(redirectError);

    await expect(
      createDonationRequest(
        INITIAL_STATE,
        makeFormData({
          bloodGroup: 'O-',
          quantity: '2',
          radiusKm: '10',
          urgency: 'critical',
        }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockConnectToDatabase).not.toHaveBeenCalled();
  });

  it('returns fieldErrors for invalid Zod payload without touching the database', async () => {
    const result = await createDonationRequest(
      INITIAL_STATE,
      makeFormData({
        bloodGroup: 'INVALID',
        quantity: '25',
        radiusKm: '15',
        urgency: 'critical',
      }),
    );

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.bloodGroup).toBeDefined();
    expect(result.fieldErrors?.quantity).toBeDefined();
    expect(result.fieldErrors?.radiusKm).toBeDefined();
    expect(mockConnectToDatabase).not.toHaveBeenCalled();
    expect(mockDonationRequestCreate).not.toHaveBeenCalled();
  });

  it('handles zero matched donors by saving request and suggesting 20 km expansion when radius < 20', async () => {
    mockDonorFindLean.mockResolvedValue([]);
    mockDonationRequestCreate.mockResolvedValue({
      _id: 'req-obj-0',
      requestId: 'REQ-111222',
    });

    const result = await createDonationRequest(
      INITIAL_STATE,
      makeFormData({
        bloodGroup: 'O-',
        quantity: '2',
        radiusKm: '10',
        urgency: 'critical',
        notes: 'Emergency trauma ward',
      }),
    );

    expect(result).toEqual({
      success: true,
      requestId: 'REQ-111222',
      requestObjectId: 'req-obj-0',
      matchedCount: 0,
      radiusKm: 10,
      bloodGroup: 'O-',
      pushSentCount: 0,
      pushAttemptedCount: 0,
      emailSentCount: 0,
      emailAttemptedCount: 0,
      emailOptedOutCount: 0,
      suggestExpandRadius: true,
    });
    expect(mockDispatchPushAlerts).not.toHaveBeenCalled();
    expect(mockDispatchEmergencyEmailAlerts).not.toHaveBeenCalled();
    expect(mockHospitalFindByIdAndUpdate).toHaveBeenCalledWith('hospital-1', {
      $inc: { activeRequestsCount: 1 },
    });
  });

  it('dispatches Web Push to all matched donors and respects donor emailAlertsEnabled opt-in', async () => {
    mockDonorFindLean.mockResolvedValue([
      {
        _id: 'donor-opted-in',
        fullName: 'Kasun Perera',
        email: 'kasun@example.lk',
        emailAlertsEnabled: true,
        location: { type: 'Point', coordinates: [79.8653, 6.8511] },
      },
      {
        _id: 'donor-opted-out',
        fullName: 'Nimali Silva',
        email: 'nimali@example.lk',
        emailAlertsEnabled: false,
        location: { type: 'Point', coordinates: [79.8612, 6.9271] },
      },
    ]);

    mockDonationRequestCreate.mockResolvedValue({
      _id: 'req-obj-1',
      requestId: 'REQ-999000',
    });
    mockDispatchPushAlerts.mockResolvedValue({
      attempted: 2,
      sent: 2,
      failed: 0,
      removedStale: 0,
    });
    mockDispatchEmergencyEmailAlerts.mockResolvedValue({
      attempted: 1,
      sent: 1,
      failed: 0,
    });

    const result = await createDonationRequest(
      INITIAL_STATE,
      makeFormData({
        bloodGroup: 'A+',
        quantity: '3',
        radiusKm: '10',
        urgency: 'critical',
        notes: 'ICU surgery',
      }),
    );

    expect(mockDonationRequestCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        bloodGroup: 'A+',
        quantity: 3,
        radiusKm: 10,
        status: 'pending',
        matchedDonorsCount: 2,
        notifiedDonors: ['donor-opted-in', 'donor-opted-out'],
      }),
    );

    expect(mockDispatchPushAlerts).toHaveBeenCalledWith(
      expect.objectContaining({
        donorIds: ['donor-opted-in', 'donor-opted-out'],
        payload: expect.objectContaining({
          url: '/donor/requests/req-obj-1',
          bloodGroup: 'A+',
          urgency: 'critical',
        }),
      }),
    );

    expect(mockDispatchEmergencyEmailAlerts).toHaveBeenCalledWith(
      expect.objectContaining({
        donorsWithDistance: [
          expect.objectContaining({
            donor: expect.objectContaining({ email: 'kasun@example.lk' }),
            distanceKm: 8.5,
          }),
        ],
      }),
    );

    expect(result).toEqual({
      success: true,
      requestId: 'REQ-999000',
      requestObjectId: 'req-obj-1',
      matchedCount: 2,
      radiusKm: 10,
      bloodGroup: 'A+',
      pushSentCount: 2,
      pushAttemptedCount: 2,
      emailSentCount: 1,
      emailAttemptedCount: 1,
      emailOptedOutCount: 1,
      suggestExpandRadius: false,
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith('/hospital/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/hospital/tracking');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/donor/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/donor/requests');
  });

  it('retries cleanly on MongoDB E11000 duplicate requestId collision', async () => {
    mockDonorFindLean.mockResolvedValue([]);
    mockDonationRequestCreate
      .mockRejectedValueOnce(
        Object.assign(new Error('dup key'), { code: 11000 }),
      )
      .mockResolvedValueOnce({
        _id: 'req-obj-retry',
        requestId: 'REQ-654321',
      });

    const result = await createDonationRequest(
      INITIAL_STATE,
      makeFormData({
        bloodGroup: 'B+',
        quantity: '1',
        radiusKm: '20',
        urgency: 'high',
      }),
    );

    expect(mockDonationRequestCreate).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.requestObjectId).toBe('req-obj-retry');
    expect(result.suggestExpandRadius).toBe(false);
  });
});
