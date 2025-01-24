self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});


self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body,
        icon: '', // Add your icon here
        badge: '', // Add your badge here
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/')); 
});