'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';

export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp(), false);
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp, true);
}

export function getSdks(firebaseApp: FirebaseApp, enablePersistence: boolean = false) {
  const firestore =
    typeof window !== 'undefined' && enablePersistence
      ? initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentSingleTabManager({}),
          }),
        })
      : getFirestore(firebaseApp);

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore,
  };
}

export * from './provider';
export { FirebaseClientProvider } from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';