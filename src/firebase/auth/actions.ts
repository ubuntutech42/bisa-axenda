
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { getSdks } from '@/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { createUserProfile } from '@/lib/user';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';
import { doc, updateDoc } from 'firebase/firestore';

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
    updateAuthProfile(user, { displayName: name }).then(async () => {
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

// Update user profile
export async function updateUserProfile(uid: string, data: {
    displayName?: string;
    photoURL?: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: string;
    bio?: string;
}) {
    const { auth, firestore } = getFirebaseServices();
    const user = auth.currentUser;

    if (!user || user.uid !== uid) {
        throw new Error("Permissão negada.");
    }

    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (data.displayName) authUpdates.displayName = data.displayName;
    if (data.photoURL) authUpdates.photoURL = data.photoURL;

    const firestoreUpdates: any = {};
    if (data.firstName) firestoreUpdates.firstName = data.firstName;
    if (data.lastName) firestoreUpdates.lastName = data.lastName;
    if (data.displayName) firestoreUpdates.userName = data.displayName;
    if (data.age) firestoreUpdates.age = data.age;
    if (data.gender) firestoreUpdates.gender = data.gender;
    if (data.bio) firestoreUpdates.bio = data.bio;


    try {
        // Update Firebase Auth profile
        if (Object.keys(authUpdates).length > 0) {
            await updateAuthProfile(user, authUpdates);
        }

        // Update Firestore user document
        if (Object.keys(firestoreUpdates).length > 0) {
            const userDocRef = doc(firestore, 'users', uid);
            await updateDoc(userDocRef, firestoreUpdates);
        }
    } catch (error: any) {
        console.error("Error updating profile:", error);
        throw new Error("Ocorreu um erro ao atualizar o perfil.");
    }
}
