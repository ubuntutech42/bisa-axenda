'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { createUserProfile } from '@/lib/user';
import { getFirestore } from 'firebase/firestore';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    console.error("Anonymous sign-in failed:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, name: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      // After user is created, update their profile and create firestore doc
      updateProfile(user, { displayName: name }).then(() => {
        const firestore = getFirestore(authInstance.app);
        createUserProfile(user, firestore).catch(e => {
            console.error("Failed to create user profile after signup:", e);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: `users/${user.uid}`,
                requestResourceData: { email: user.email, name: user.displayName }
            }));
        });
      }).catch(error => {
        console.error("Failed to update profile after signup:", error);
      });
    })
    .catch(error => {
      // Handle signup errors (e.g., email already in use)
      // This is a good place to show a toast to the user
      console.error("Email sign-up failed:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        // Handle sign-in errors (e.g., wrong password)
        // This is a good place to show a toast to the user
        console.error("Email sign-in failed:", error);
    });
}
