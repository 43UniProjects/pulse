self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || 'Pulse Emergency Blood Alert';
  const targetUrl =
    typeof payload.url === 'string' && payload.url.length > 0
      ? payload.url
      : '/donor/dashboard';

  const options = {
    body:
      payload.body ||
      'A nearby hospital urgently needs a compatible blood donor.',
    icon: payload.icon || '/logo/logo.png',
    badge: payload.badge || '/logo/logo.png',
    tag: payload.tag || 'pulse-emergency-alert',
    renotify: true,
    requireInteraction: payload.urgency === 'critical',
    vibrate: [150, 75, 150],
    data: {
      url: targetUrl,
      requestId: payload.requestId || '',
      urgency: payload.urgency || 'normal',
      bloodGroup: payload.bloodGroup || '',
      hospitalName: payload.hospitalName || '',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl =
    (event.notification.data && event.notification.data.url) ||
    '/donor/dashboard';

  let targetUrl = `${self.location.origin}/donor/dashboard`;
  try {
    const resolved = new URL(rawUrl, self.location.origin);
    if (resolved.origin === self.location.origin) {
      targetUrl = resolved.href;
    }
  } catch {
    targetUrl = `${self.location.origin}/donor/dashboard`;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (
            client.url.startsWith(self.location.origin) &&
            'focus' in client
          ) {
            if ('navigate' in client && client.url !== targetUrl) {
              return client.navigate(targetUrl).then(() => client.focus());
            }
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
