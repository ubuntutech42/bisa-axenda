
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { getSdks } from '@/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { createUserProfile } from '@/lib/user';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';

// Helper to initialize and get services
function getFirebaseServices() {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const { firestore } = getSdks(app);
  return { auth, firestore };
}

// Sign up with email and password
export async function signup(name: string, email: string, password: string) {
  const { auth, firestore } = getFirebaseServices();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // This can happen in the background. The user is already authenticated.
    updateProfile(user, { displayName: name }).then(async () => {
        try {
            await createUserProfile(user, firestore);
        } catch (e: any) {
            console.error("Failed to create user profile after signup:", e);
            // Optionally, emit a custom event to track this failure
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: `users/${user.uid}`,
                requestResourceData: { email: user.email, name: user.displayName }
            }));
        }
    });

    return { uid: user.uid, email: user.email };
  } catch (error: any) {
    throw new Error(error.message);
  }
}


// Send password reset email
export async function sendPasswordReset(email: string) {
  const { auth } = getFirebaseServices();
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
     if (error.code === 'auth/user-not-found') {
        throw new Error('Nenhum usuário encontrado com este e-mail.');
    }
    throw new Error('Não foi possível enviar o e-mail de redefinição de senha.');
  }
}
