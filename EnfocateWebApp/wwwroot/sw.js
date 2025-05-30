self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
    const data = e.data?.json() || {};
    const title = data.title || '¡Enfócate!';
    const options = {
        body: data.body || '',
        requireInteraction: true
    };
    e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(self.clients.matchAll({ type: 'window' })
        .then(clients => clients[0]?.focus()));
});
