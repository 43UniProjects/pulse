import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHeaders = vi.fn();
const mockRevalidatePath = vi.fn();
const mockGetSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockUserFindByIdLean = vi.fn();
const mockUserFindByIdSelect = vi.fn(() => ({ lean: mockUserFindByIdLean }));
const mockUserFindById = vi.fn((...args: unknown[]) => {
  void args;
  return { select: mockUserFindByIdSelect };
});
const mockFindOneAndUpdate = vi.fn();
const mockDeleteOne = vi.fn();
const mockExists = vi.fn();

vi.mock('next/headers', () => ({
  headers: (...args: unknown[]) => mockHeaders(...args),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock('../lib/auth/config', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock('../lib/db/connect', () => ({
  connectToDatabase: (...args: unknown[]) => mockConnectToDatabase(...args),
}));

vi.mock('../lib/models/user.model', () => ({
  User: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
  },
}));

vi.mock('../lib/models/push-subscription.model', () => ({
  PushSubscription: {
    findOneAndUpdate: (...args: unknown[]) => mockFindOneAndUpdate(...args),
    deleteOne: (...args: unknown[]) => mockDeleteOne(...args),
    exists: (...args: unknown[]) => mockExists(...args),
  },
}));

import {
  getDonorPushSubscriptionStatus,
  removePushSubscription,
  savePushSubscription,
} from './push.actions';

const VALID_SUBSCRIPTION = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test-token-123',
  expirationTime: null,
  keys: {
    p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls',
    auth: 'tBHItJI5svbpez7KI4CCXg',
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockHeaders.mockResolvedValue(new Headers());
  mockConnectToDatabase.mockResolvedValue({});
  mockGetSession.mockResolvedValue({
    user: { id: 'donor-1', role: 'donor', isActive: true },
  });
  mockUserFindByIdLean.mockResolvedValue({ _id: 'donor-1', isActive: true });
});

describe('Push subscription server actions (push.actions.ts)', () => {
  it('rejects unauthenticated callers without touching MongoDB', async () => {
    mockGetSession.mockResolvedValueOnce(null);

    const result = await savePushSubscription(VALID_SUBSCRIPTION);

    expect(result.success).toBe(false);
    expect(result.error).toContain('signed in as a donor');
    expect(mockConnectToDatabase).not.toHaveBeenCalled();
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects non-donor roles such as hospital and admin', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'hospital-1', role: 'hospital', isActive: true },
    });

    const result = await removePushSubscription(VALID_SUBSCRIPTION.endpoint);

    expect(result.success).toBe(false);
    expect(result.error).toContain('donor');
    expect(mockDeleteOne).not.toHaveBeenCalled();
  });

  it('rejects inactive donor accounts based on live MongoDB User.isActive', async () => {
    mockUserFindByIdLean.mockResolvedValueOnce({
      _id: 'donor-1',
      isActive: false,
    });

    const result = await savePushSubscription(VALID_SUBSCRIPTION);

    expect(result.success).toBe(false);
    expect(result.error).toContain('activate your donor profile');
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects malformed endpoint URLs and empty encryption keys via Zod', async () => {
    const badEndpoint = await savePushSubscription({
      ...VALID_SUBSCRIPTION,
      endpoint: 'not-a-valid-url',
    });
    const missingKeys = await savePushSubscription({
      ...VALID_SUBSCRIPTION,
      keys: { p256dh: '', auth: '' },
    });

    expect(badEndpoint.success).toBe(false);
    expect(missingKeys.success).toBe(false);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('upserts valid donor push subscription by endpoint and revalidates donor dashboard', async () => {
    mockFindOneAndUpdate.mockResolvedValueOnce({ _id: 'sub-1' });

    const result = await savePushSubscription(
      VALID_SUBSCRIPTION,
      'Mozilla/5.0 TestBrowser',
    );

    expect(result).toEqual({ success: true });
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { endpoint: VALID_SUBSCRIPTION.endpoint },
      {
        donorId: 'donor-1',
        endpoint: VALID_SUBSCRIPTION.endpoint,
        expirationTime: null,
        keys: VALID_SUBSCRIPTION.keys,
        userAgent: 'Mozilla/5.0 TestBrowser',
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith('/donor/dashboard');
  });

  it('removes donor push subscription scoped to authenticated donorId and endpoint', async () => {
    mockDeleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const result = await removePushSubscription(VALID_SUBSCRIPTION.endpoint);

    expect(result).toEqual({ success: true });
    expect(mockDeleteOne).toHaveBeenCalledWith({
      donorId: 'donor-1',
      endpoint: VALID_SUBSCRIPTION.endpoint,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/donor/dashboard');
  });

  it('checks subscription status globally and scoped by endpoint', async () => {
    mockExists
      .mockResolvedValueOnce({ _id: 'sub-1' })
      .mockResolvedValueOnce(null);

    const byEndpoint = await getDonorPushSubscriptionStatus(
      VALID_SUBSCRIPTION.endpoint,
    );
    const anyForDonor = await getDonorPushSubscriptionStatus();

    expect(byEndpoint).toEqual({ success: true, subscribed: true });
    expect(anyForDonor).toEqual({ success: true, subscribed: false });
    expect(mockExists).toHaveBeenNthCalledWith(1, {
      donorId: 'donor-1',
      endpoint: VALID_SUBSCRIPTION.endpoint,
    });
    expect(mockExists).toHaveBeenNthCalledWith(2, {
      donorId: 'donor-1',
    });
  });
});
