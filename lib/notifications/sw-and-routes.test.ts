import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { describe, expect, it, vi } from 'vitest';

type EventHandler = (event: unknown) => void;

function loadServiceWorkerHarness(origin = 'https://pulse.example.lk') {
  const listeners = new Map<string, EventHandler>();
  const showNotification = vi.fn().mockResolvedValue(undefined);
  const matchAll = vi.fn().mockResolvedValue([]);
  const openWindow = vi.fn().mockResolvedValue(undefined);

  const selfMock = {
    location: { origin },
    registration: { showNotification },
    clients: { matchAll, openWindow },
    addEventListener: (type: string, handler: EventHandler) => {
      listeners.set(type, handler);
    },
  };

  const swSource = fs.readFileSync(
    path.join(process.cwd(), 'public', 'sw.js'),
    'utf8',
  );

  vm.runInNewContext(swSource, { self: selfMock, URL });

  return { listeners, showNotification, matchAll, openWindow };
}

describe('Web Push Service Worker (public/sw.js)', () => {
  it('renders critical push notifications with Pulse logo and requireInteraction', async () => {
    const { listeners, showNotification } = loadServiceWorkerHarness();
    const pushHandler = listeners.get('push');
    expect(pushHandler).toBeDefined();

    let waitPromise: Promise<unknown> = Promise.resolve();
    pushHandler!({
      data: {
        json: () => ({
          title: 'CRITICAL: O- Blood Needed',
          body: 'National Hospital needs 2 units of O- blood.',
          urgency: 'critical',
          bloodGroup: 'O-',
          hospitalName: 'National Hospital',
          requestId: 'REQ-123456',
          url: '/donor/requests/65f000000000000000000001',
          icon: '/logo/logo.png',
          badge: '/logo/logo.png',
          tag: 'pulse-request-65f000000000000000000001',
        }),
      },
      waitUntil: (promise: Promise<unknown>) => {
        waitPromise = promise;
      },
    });

    await waitPromise;

    expect(showNotification).toHaveBeenCalledWith(
      'CRITICAL: O- Blood Needed',
      expect.objectContaining({
        body: 'National Hospital needs 2 units of O- blood.',
        icon: '/logo/logo.png',
        badge: '/logo/logo.png',
        requireInteraction: true,
        data: expect.objectContaining({
          url: '/donor/requests/65f000000000000000000001',
        }),
      }),
    );
  });

  it('handles non-JSON plain-text push payloads cleanly without throwing', async () => {
    const { listeners, showNotification } = loadServiceWorkerHarness();
    const pushHandler = listeners.get('push');

    let waitPromise: Promise<unknown> = Promise.resolve();
    pushHandler!({
      data: {
        json: () => {
          throw new Error('Invalid JSON');
        },
        text: () => 'Plain text emergency ping',
      },
      waitUntil: (promise: Promise<unknown>) => {
        waitPromise = promise;
      },
    });

    await waitPromise;

    expect(showNotification).toHaveBeenCalledWith(
      'Pulse Emergency Blood Alert',
      expect.objectContaining({
        body: 'Plain text emergency ping',
        requireInteraction: false,
        data: expect.objectContaining({
          url: '/donor/dashboard',
        }),
      }),
    );
  });

  it('opens target donor request URL in a new window when no app tab is open', async () => {
    const { listeners, openWindow } = loadServiceWorkerHarness();
    const clickHandler = listeners.get('notificationclick');
    const close = vi.fn();

    let waitPromise: Promise<unknown> = Promise.resolve();
    clickHandler!({
      notification: {
        close,
        data: { url: '/donor/requests/65f000000000000000000055' },
      },
      waitUntil: (promise: Promise<unknown>) => {
        waitPromise = promise;
      },
    });

    await waitPromise;

    expect(close).toHaveBeenCalledTimes(1);
    expect(openWindow).toHaveBeenCalledWith(
      'https://pulse.example.lk/donor/requests/65f000000000000000000055',
    );
  });

  it('navigates and focuses an existing same-origin tab instead of opening a duplicate window', async () => {
    const { listeners, matchAll, openWindow } = loadServiceWorkerHarness();
    const focus = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn().mockResolvedValue(undefined);
    matchAll.mockResolvedValueOnce([
      {
        url: 'https://pulse.example.lk/donor/dashboard',
        focus,
        navigate,
      },
    ]);

    const clickHandler = listeners.get('notificationclick');
    let waitPromise: Promise<unknown> = Promise.resolve();

    clickHandler!({
      notification: {
        close: vi.fn(),
        data: { url: '/donor/requests/65f000000000000000000077' },
      },
      waitUntil: (promise: Promise<unknown>) => {
        waitPromise = promise;
      },
    });

    await waitPromise;

    expect(navigate).toHaveBeenCalledWith(
      'https://pulse.example.lk/donor/requests/65f000000000000000000077',
    );
    expect(focus).toHaveBeenCalledTimes(1);
    expect(openWindow).not.toHaveBeenCalled();
  });

  it('blocks cross-origin notification URLs and falls back to /donor/dashboard', async () => {
    const { listeners, openWindow } = loadServiceWorkerHarness();
    const clickHandler = listeners.get('notificationclick');

    let waitPromise: Promise<unknown> = Promise.resolve();
    clickHandler!({
      notification: {
        close: vi.fn(),
        data: { url: 'https://evil.example.com/phishing' },
      },
      waitUntil: (promise: Promise<unknown>) => {
        waitPromise = promise;
      },
    });

    await waitPromise;

    expect(openWindow).toHaveBeenCalledWith(
      'https://pulse.example.lk/donor/dashboard',
    );
  });
});

describe('Broadcast navigation targets & static assets integrity', () => {
  const requiredProjectFiles = [
    'app/(users)/donor/dashboard/page.tsx',
    'app/(users)/donor/profile/page.tsx',
    'app/(users)/donor/requests/page.tsx',
    'app/(users)/donor/requests/[id]/page.tsx',
    'app/(users)/hospital/dashboard/page.tsx',
    'app/(users)/hospital/post-request/page.tsx',
    'app/(users)/hospital/tracking/[id]/page.tsx',
    'public/sw.js',
    'public/logo/logo.png',
  ];

  it.each(requiredProjectFiles)(
    'verifies target route/asset exists at %s',
    (relativePath) => {
      const fullPath = path.join(process.cwd(), relativePath);
      expect(fs.existsSync(fullPath)).toBe(true);
    },
  );
});
