import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSendNotification = vi.fn();
const mockSetVapidDetails = vi.fn();
const mockFindLean = vi.fn();
const mockFind = vi.fn((...args: unknown[]) => {
  void args;
  return { lean: mockFindLean };
});
const mockDeleteMany = vi.fn();
const mockSendMail = vi.fn();

vi.mock('web-push', () => ({
  sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
}));

vi.mock('@/lib/models/push-subscription.model', () => ({
  PushSubscription: {
    find: (...args: unknown[]) => mockFind(...args),
    deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
  },
}));

vi.mock('@/lib/mail', () => ({
  transporter: {
    sendMail: (...args: unknown[]) => mockSendMail(...args),
  },
}));

import {
  buildEmergencyPushPayload,
  dispatchPushAlerts,
  ensureVapidConfigured,
  resetVapidConfigCacheForTests,
} from '@/lib/notifications/push-alert';
import {
  dispatchEmergencyEmailAlerts,
  escapeHtml,
  sendEmergencyAlertEmail,
} from '@/lib/notifications/email-alert';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  resetVapidConfigCacheForTests();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.SMTP_FROM_EMAIL;
  process.env.NEXT_PUBLIC_APP_URL = 'https://pulse.example.lk';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe('Web Push alert dispatcher (push-alert.ts)', () => {
  it('does not configure VAPID on import and skips cleanly when VAPID env vars are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(mockSetVapidDetails).not.toHaveBeenCalled();
    expect(ensureVapidConfigured()).toBe(false);

    const payload = buildEmergencyPushPayload({
      requestObjectId: '65f000000000000000000001',
      requestId: 'REQ-123456',
      bloodGroup: 'O-',
      urgency: 'critical',
      hospitalName: 'National Hospital Colombo',
      quantity: 2,
    });

    const result = await dispatchPushAlerts({
      donorIds: ['65f000000000000000000010'],
      payload,
    });

    expect(result).toEqual({
      attempted: 0,
      sent: 0,
      failed: 0,
      removedStale: 0,
      skipped: true,
    });
    expect(mockFind).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('builds the standardized emergency push payload with target URL and logo icon', () => {
    const payload = buildEmergencyPushPayload({
      requestObjectId: '65f000000000000000000099',
      requestId: 'REQ-888999',
      bloodGroup: 'A+',
      urgency: 'critical',
      hospitalName: 'Colombo South Teaching Hospital',
      quantity: 3,
    });

    expect(payload).toEqual({
      title: 'CRITICAL: A+ Blood Needed',
      body: 'Colombo South Teaching Hospital needs 3 units of A+ blood (REQ-888999). Tap to view and respond.',
      urgency: 'critical',
      bloodGroup: 'A+',
      hospitalName: 'Colombo South Teaching Hospital',
      requestId: 'REQ-888999',
      url: '/donor/requests/65f000000000000000000099',
      icon: '/logo/logo.png',
      badge: '/logo/logo.png',
      tag: 'pulse-request-65f000000000000000000099',
    });
  });

  it('returns zero counts immediately when matched donor list is empty', async () => {
    const payload = buildEmergencyPushPayload({
      requestObjectId: '65f000000000000000000002',
      requestId: 'REQ-000000',
      bloodGroup: 'B+',
      urgency: 'normal',
      hospitalName: 'General Hospital',
    });

    const result = await dispatchPushAlerts({ donorIds: [], payload });

    expect(result).toEqual({
      attempted: 0,
      sent: 0,
      failed: 0,
      removedStale: 0,
    });
    expect(mockFind).not.toHaveBeenCalled();
    expect(mockSendNotification).not.toHaveBeenCalled();
  });

  it('dispatches via Promise.allSettled and deletes stale 410 and 404 subscriptions without blocking others', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';
    process.env.VAPID_SUBJECT = 'mailto:admin@pulse.lk';

    mockFindLean.mockResolvedValue([
      {
        _id: 'sub-ok',
        donorId: 'donor-1',
        endpoint: 'https://push.example.com/ok',
        expirationTime: null,
        keys: { p256dh: 'p256dh-1', auth: 'auth-1' },
      },
      {
        _id: 'sub-410',
        donorId: 'donor-2',
        endpoint: 'https://push.example.com/gone',
        expirationTime: null,
        keys: { p256dh: 'p256dh-2', auth: 'auth-2' },
      },
      {
        _id: 'sub-404',
        donorId: 'donor-3',
        endpoint: 'https://push.example.com/not-found',
        expirationTime: null,
        keys: { p256dh: 'p256dh-3', auth: 'auth-3' },
      },
      {
        _id: 'sub-500',
        donorId: 'donor-4',
        endpoint: 'https://push.example.com/server-err',
        expirationTime: null,
        keys: { p256dh: 'p256dh-4', auth: 'auth-4' },
      },
    ]);

    mockSendNotification
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockRejectedValueOnce(
        Object.assign(new Error('Gone'), { statusCode: 410 }),
      )
      .mockRejectedValueOnce(
        Object.assign(new Error('Not Found'), { statusCode: 404 }),
      )
      .mockRejectedValueOnce(
        Object.assign(new Error('Internal Error'), { statusCode: 500 }),
      );

    mockDeleteMany.mockResolvedValue({ deletedCount: 2 });

    const payload = buildEmergencyPushPayload({
      requestObjectId: '65f000000000000000000003',
      requestId: 'REQ-555111',
      bloodGroup: 'O+',
      urgency: 'high',
      hospitalName: 'National Hospital Colombo',
      quantity: 1,
    });

    const result = await dispatchPushAlerts({
      donorIds: ['donor-1', 'donor-2', 'donor-3', 'donor-4'],
      payload,
    });

    expect(mockSetVapidDetails).toHaveBeenCalledTimes(1);
    expect(mockSetVapidDetails).toHaveBeenCalledWith(
      'mailto:admin@pulse.lk',
      'test-public-key',
      'test-private-key',
    );
    expect(mockSendNotification).toHaveBeenCalledTimes(4);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      _id: { $in: ['sub-410', 'sub-404'] },
    });
    expect(result).toEqual({
      attempted: 4,
      sent: 1,
      failed: 3,
      removedStale: 2,
    });
  });
});

describe('Emergency email alert dispatcher (email-alert.ts)', () => {
  it('escapes all dangerous HTML characters', () => {
    expect(escapeHtml(`<script>alert("xss" & 'test')</script>`)).toBe(
      '&lt;script&gt;alert(&quot;xss&quot; &amp; &#39;test&#39;)&lt;/script&gt;',
    );
  });

  it('sends an HTML-escaped emergency email with blood group, distance, and CTA link', async () => {
    process.env.SMTP_USER = 'noreply@pulse.example.lk';
    process.env.SMTP_FROM_EMAIL = '"Pulse Network" <noreply@pulse.example.lk>';
    mockSendMail.mockResolvedValue({ messageId: 'mock-id-1' });

    await sendEmergencyAlertEmail({
      donor: {
        fullName: 'Kasun <script>alert(1)</script>',
        email: 'kasun@example.lk',
      },
      request: {
        _id: '65f000000000000000000077',
        requestId: 'REQ-770011',
        bloodGroup: 'O-',
        quantity: 2,
        urgency: 'critical',
        notes: 'Trauma ICU & "urgent" <cross-match>',
      },
      hospital: {
        name: 'National Hospital & Trauma Center',
        address: 'Regent Street, Colombo 08',
        hotline: '+94 11 269 1111',
      },
      distanceKm: 8.46,
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailArgs = mockSendMail.mock.calls[0][0] as {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    };

    expect(mailArgs.to).toBe('kasun@example.lk');
    expect(mailArgs.subject).toContain('CRITICAL');
    expect(mailArgs.subject).toContain('O-');
    expect(mailArgs.html).toContain('O-');
    expect(mailArgs.html).toContain('8.5 km away');
    expect(mailArgs.html).toContain('View Request &amp; Accept');
    expect(mailArgs.html).toContain(
      'https://pulse.example.lk/donor/requests/65f000000000000000000077',
    );
    expect(mailArgs.html).not.toContain('<script>');
    expect(mailArgs.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(mailArgs.html).toContain(
      'Trauma ICU &amp; &quot;urgent&quot; &lt;cross-match&gt;',
    );
    expect(mailArgs.text).toContain(
      'https://pulse.example.lk/donor/requests/65f000000000000000000077',
    );
  });

  it('skips batch email dispatch cleanly when SMTP credentials are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await dispatchEmergencyEmailAlerts({
      donorsWithDistance: [
        {
          donor: { fullName: 'Donor One', email: 'one@example.lk' },
          distanceKm: 3.2,
        },
      ],
      request: {
        _id: '65f000000000000000000088',
        requestId: 'REQ-880011',
        bloodGroup: 'A+',
        quantity: 1,
        urgency: 'high',
      },
      hospital: {
        name: 'Colombo Hospital',
        address: 'Colombo 07',
      },
    });

    expect(result).toEqual({
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: true,
    });
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('isolates per-recipient SMTP errors via Promise.allSettled and sends to all valid provided recipients', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.SMTP_USER = 'noreply@pulse.example.lk';
    process.env.SMTP_PASSWORD = 'mock-app-password';

    mockSendMail
      .mockResolvedValueOnce({ messageId: 'ok-1' })
      .mockRejectedValueOnce(new Error('550 mailbox unavailable'))
      .mockResolvedValueOnce({ messageId: 'ok-3' });

    const result = await dispatchEmergencyEmailAlerts({
      donorsWithDistance: [
        {
          donor: { fullName: 'Donor One', email: 'one@example.lk' },
          distanceKm: 1.5,
        },
        {
          donor: { fullName: 'Bad Address', email: 'bounce@example.lk' },
          distanceKm: 4.0,
        },
        {
          donor: { fullName: 'Missing Email', email: '   ' },
          distanceKm: 5.0,
        },
        {
          donor: { fullName: 'Donor Three', email: 'three@example.lk' },
          distanceKm: 9.1,
        },
      ],
      request: {
        _id: '65f000000000000000000089',
        requestId: 'REQ-890011',
        bloodGroup: 'B+',
        quantity: 2,
        urgency: 'normal',
      },
      hospital: {
        name: 'Colombo Hospital',
        address: 'Colombo 07',
      },
    });

    expect(mockSendMail).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      attempted: 3,
      sent: 2,
      failed: 1,
    });
  });
});
