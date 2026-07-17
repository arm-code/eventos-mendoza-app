'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('PWA Service Worker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('PWA Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
