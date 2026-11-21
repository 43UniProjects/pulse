'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@base-ui/react/switch';
import { cn } from 'cn';
import { AlertCircle, Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getDonorPushSubscriptionStatus,
  removePushSubscription,
  savePushSubscription,
} from '@/actions/push.actions';
import type { SerializedPushSubscription } from '@/types/push-subscription.type';

export interface PushSubscriptionToggleProps {
  vapidPublicKey?: string;
  initialSubscribed?: boolean;
}

type SupportState = 'checking' | 'supported' | 'unsupported';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function serializeBrowserSubscription(
  subscription: PushSubscription,
): SerializedPushSubscription | null {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh,
      auth,
    },
  };
}

export default function PushSubscriptionToggle({
  vapidPublicKey,
  initialSubscribed = false,
}: PushSubscriptionToggleProps) {
  const resolvedVapidKey = (
    vapidPublicKey ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    ''
  ).trim();

  const [supportState, setSupportState] = useState<SupportState>('checking');
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(initialSubscribed);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function syncSubscriptionState() {
      const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      if (!supported) {
        if (!cancelled) {
          setSupportState('unsupported');
          setIsSubscribed(false);
        }
        return;
      }

      if (!cancelled) {
        setSupportState('supported');
        setPermission(Notification.permission);
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        const existingSub = await registration.pushManager.getSubscription();

        if (!existingSub) {
          if (!cancelled) {
            setIsSubscribed(false);
          }
          return;
        }

        const status = await getDonorPushSubscriptionStatus(
          existingSub.endpoint,
        );
        if (!cancelled) {
          setIsSubscribed(status.success ? status.subscribed : false);
        }
      } catch (error) {
        console.error(
          '[PushSubscriptionToggle] Failed to initialize service worker:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        if (!cancelled) {
          setIsSubscribed(false);
        }
      }
    }

    syncSubscriptionState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enablePushNotifications() {
    if (!resolvedVapidKey) {
      toast.error(
        'Push notifications are not configured on the server yet. Please contact support.',
      );
      return;
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      toast.error(
        'Notifications are blocked in your browser settings. Allow notifications for this site to enable alerts.',
      );
      return;
    }

    let currentPermission: NotificationPermission = Notification.permission;
    if (currentPermission === 'default') {
      currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);
    }

    if (currentPermission !== 'granted') {
      toast.error(
        'Notification permission was not granted. You can enable it anytime in your browser settings.',
      );
      return;
    }

    await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const registration = await navigator.serviceWorker.ready;

    let browserSub = await registration.pushManager.getSubscription();
    if (!browserSub) {
      browserSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(resolvedVapidKey),
      });
    }

    const serialized = serializeBrowserSubscription(browserSub);
    if (!serialized) {
      toast.error('Browser returned an incomplete push subscription.');
      return;
    }

    const result = await savePushSubscription(serialized, navigator.userAgent);
    if (!result.success) {
      toast.error(result.error || 'Failed to save push notification settings.');
      return;
    }

    setIsSubscribed(true);
    toast.success('Browser emergency alerts enabled for this device.');
  }

  async function disablePushNotifications() {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const browserSub = registration
      ? await registration.pushManager.getSubscription()
      : null;

    if (browserSub) {
      const endpoint = browserSub.endpoint;
      const result = await removePushSubscription(endpoint);
      if (!result.success) {
        toast.error(
          result.error || 'Failed to remove push subscription from server.',
        );
        return;
      }

      await browserSub.unsubscribe();
    }

    setIsSubscribed(false);
    toast.success('Browser emergency alerts disabled for this device.');
  }

  async function handleToggleChange(nextChecked: boolean) {
    if (isUpdating || supportState !== 'supported') {
      return;
    }

    setIsUpdating(true);
    try {
      if (nextChecked) {
        await enablePushNotifications();
      } else {
        await disablePushNotifications();
      }
    } catch (error) {
      console.error(
        '[PushSubscriptionToggle] Failed to update push subscription:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      toast.error(
        'Unable to update browser push notifications. Please check your browser settings and try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  const isDisabled =
    isUpdating ||
    supportState !== 'supported' ||
    (!isSubscribed && permission === 'denied');

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        <div
          className={cn(
            'p-2 rounded-lg shrink-0 mt-0.5',
            isSubscribed
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          {isSubscribed ? (
            <Bell className="w-5 h-5" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">
              {isSubscribed ? 'Push alerts are on' : 'Browser push alerts'}
            </span>
            {isUpdating && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>

          {supportState === 'unsupported' ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Push notifications are not supported in this browser.
            </p>
          ) : permission === 'denied' ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Notifications are blocked. Allow notifications in your browser
                site settings to receive instant emergency alerts.
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isSubscribed
                ? 'This device will receive instant browser notifications when a nearby hospital needs your blood group.'
                : 'Enable instant browser notifications to respond faster when a nearby hospital needs your blood group.'}
            </p>
          )}
        </div>
      </div>

      <Switch.Root
        checked={isSubscribed}
        onCheckedChange={handleToggleChange}
        disabled={isDisabled}
        aria-label="Toggle browser emergency push notifications"
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 mt-0.5 items-center rounded-full border border-transparent transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isSubscribed ? 'bg-primary' : 'bg-border',
        )}
      >
        <Switch.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            isSubscribed ? 'translate-x-[21px]' : 'translate-x-[1px]',
          )}
        />
      </Switch.Root>
    </div>
  );
}
