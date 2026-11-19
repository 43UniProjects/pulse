import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

const mockSavePushSubscription = vi.fn();
const mockRemovePushSubscription = vi.fn();
const mockGetDonorPushSubscriptionStatus = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('../../actions/push.actions', () => ({
  savePushSubscription: (...args: unknown[]) =>
    mockSavePushSubscription(...args),
  removePushSubscription: (...args: unknown[]) =>
    mockRemovePushSubscription(...args),
  getDonorPushSubscriptionStatus: (...args: unknown[]) =>
    mockGetDonorPushSubscriptionStatus(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

import PushSubscriptionToggle from './push-subscription-toggle';

const SAMPLE_VAPID_PUBLIC_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

const originalServiceWorker = Object.getOwnPropertyDescriptor(
  navigator,
  'serviceWorker',
);
const originalPushManager = Object.getOwnPropertyDescriptor(
  window,
  'PushManager',
);
const originalNotification = Object.getOwnPropertyDescriptor(
  window,
  'Notification',
);

function restoreBrowserApis() {
  if (originalServiceWorker) {
    Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
  } else {
    Reflect.deleteProperty(navigator, 'serviceWorker');
  }

  if (originalPushManager) {
    Object.defineProperty(window, 'PushManager', originalPushManager);
  } else {
    Reflect.deleteProperty(window, 'PushManager');
  }

  if (originalNotification) {
    Object.defineProperty(window, 'Notification', originalNotification);
  } else {
    Reflect.deleteProperty(window, 'Notification');
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  restoreBrowserApis();
});

afterEach(() => {
  cleanup();
  restoreBrowserApis();
  vi.restoreAllMocks();
});

describe('PushSubscriptionToggle component', () => {
  it('displays an unsupported browser notice and disables the switch when Web Push APIs are absent', async () => {
    render(<PushSubscriptionToggle vapidPublicKey={SAMPLE_VAPID_PUBLIC_KEY} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Push notifications are not supported/i),
      ).toBeTruthy();
    });

    const toggle = screen.getByRole('switch', {
      name: /Toggle browser emergency push notifications/i,
    });
    expect(toggle.getAttribute('aria-disabled')).not.toBeNull();
  });

  it('registers /sw.js, subscribes using the server-provided VAPID key prop, and unsubscribes cleanly', async () => {
    const unsubscribeMock = vi.fn().mockResolvedValue(true);
    const mockBrowserSub = {
      endpoint: 'https://push.example.com/sub/device-1',
      unsubscribe: unsubscribeMock,
      toJSON: () => ({
        endpoint: 'https://push.example.com/sub/device-1',
        expirationTime: null,
        keys: {
          p256dh: 'mock-p256dh-key',
          auth: 'mock-auth-key',
        },
      }),
    };

    let currentSub: typeof mockBrowserSub | null = null;
    const subscribeMock = vi.fn(async () => {
      currentSub = mockBrowserSub;
      return mockBrowserSub;
    });
    const getSubscriptionMock = vi.fn(async () => currentSub);
    const registrationMock = {
      pushManager: {
        getSubscription: getSubscriptionMock,
        subscribe: subscribeMock,
      },
    };

    const registerMock = vi.fn().mockResolvedValue(registrationMock);
    const getRegistrationMock = vi.fn().mockResolvedValue(registrationMock);

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        getRegistration: getRegistrationMock,
        ready: Promise.resolve(registrationMock),
      },
    });
    Object.defineProperty(window, 'PushManager', {
      configurable: true,
      value: function PushManager() {},
    });
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
    });

    mockSavePushSubscription.mockResolvedValue({ success: true });
    mockRemovePushSubscription.mockResolvedValue({ success: true });

    render(<PushSubscriptionToggle vapidPublicKey={SAMPLE_VAPID_PUBLIC_KEY} />);

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
    });

    const toggle = screen.getByRole('switch', {
      name: /Toggle browser emergency push notifications/i,
    });

    // Enable Web Push
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(subscribeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userVisibleOnly: true,
          applicationServerKey: expect.any(Uint8Array),
        }),
      );
      expect(mockSavePushSubscription).toHaveBeenCalledWith(
        {
          endpoint: 'https://push.example.com/sub/device-1',
          expirationTime: null,
          keys: {
            p256dh: 'mock-p256dh-key',
            auth: 'mock-auth-key',
          },
        },
        expect.any(String),
      );
      expect(toggle.getAttribute('aria-checked')).toBe('true');
    });

    // Disable Web Push
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockRemovePushSubscription).toHaveBeenCalledWith(
        'https://push.example.com/sub/device-1',
      );
      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
      expect(toggle.getAttribute('aria-checked')).toBe('false');
    });
  });

  it('displays blocked permission guidance when browser notifications are denied', async () => {
    const registrationMock = {
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
      },
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue(registrationMock),
        ready: Promise.resolve(registrationMock),
      },
    });
    Object.defineProperty(window, 'PushManager', {
      configurable: true,
      value: function PushManager() {},
    });
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: {
        permission: 'denied',
        requestPermission: vi.fn().mockResolvedValue('denied'),
      },
    });

    render(<PushSubscriptionToggle vapidPublicKey={SAMPLE_VAPID_PUBLIC_KEY} />);

    await waitFor(() => {
      expect(screen.getByText(/Notifications are blocked/i)).toBeTruthy();
    });
  });
});
