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
  // #region agent log
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'firebase/index.ts:init start',message:'initializeFirebase start',data:{t:Date.now(),t0},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (getApps().length) {
    const out = getSdks(getApp(), false);
    // #region agent log
    if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'firebase/index.ts:init cached',message:'Firebase reused (cached)',data:{t:Date.now(),elapsed:typeof performance !== 'undefined' ? performance.now()-t0 : 0},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return out;
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const out = getSdks(firebaseApp, true);
  // #region agent log
  if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'firebase/index.ts:init done',message:'initializeFirebase done (fresh)',data:{t:Date.now(),elapsed:typeof performance !== 'undefined' ? performance.now()-t0 : 0},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return out;
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
export { getAxendaDataConnect } from './dataconnect';