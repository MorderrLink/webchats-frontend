"use client"
import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

export const UseSubscription = () => {

  const { user } = useClerk()

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // Register Service Worker
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);

          // Subscribe to Push Manager
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY!),
          });
          
          console.log('Push subscription:', subscription);
          console.log('userid', user?.id)
          const subscriptionData = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
            },
            userId: user?.id 
          };
          
          await fetch('http://localhost:8000/api/save-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptionData),
          });
        } catch (error) {
          console.error('Error during subscription:', error);
        }
      }
    };

    const requestNotificationPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Permission not granted for notifications.');
      }
    };

    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    };

    requestNotificationPermission();
    registerServiceWorker();
  }, [user?.id]);

  return (
    <></>
  )
};
