
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { createUserProfile } from '@/lib/user';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';
import { getFirestore, doc, updateDoc, setDoc } from 'firebase/firestore';

// Helper to initialize and get services securely on the server
function getFirebaseServices() {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
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


export async function fetchGoogleProfileData(accessToken: string, uid: string) {
    const { firestore } = getFirebaseServices();
    try {
      const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays,genders', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google People API error:', errorData);
        throw new Error(`Google People API request failed with status ${response.status}`);
      }
  
      const profileData = await response.json();
      const updates: { age?: number; gender?: string } = {};
  
      // Process gender
      if (profileData.genders && profileData.genders.length > 0) {
        const genderValue = profileData.genders[0].value;
        switch (genderValue) {
          case 'male':
            updates.gender = 'Homem';
            break;
          case 'female':
            updates.gender = 'Mulher';
            break;
          default:
            updates.gender = 'Outro';
            break;
        }
      }
  
      // Process birthday to calculate age
      if (profileData.birthdays && profileData.birthdays.length > 0) {
        const birthday = profileData.birthdays.find((b: any) => b.date);
        if (birthday && birthday.date) {
            const { year, month, day } = birthday.date;
            if (year && month && day) {
                const birthDate = new Date(year, month - 1, day);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                updates.age = age;
            }
        }
      }
      
      if (Object.keys(updates).length > 0) {
          const userDocRef = doc(firestore, 'users', uid);
          await setDoc(userDocRef, updates, { merge: true });
      }
  
    } catch (error: any) {
      console.error('Error fetching or saving Google profile data:', error.message);
      // We don't re-throw the error to not block the user's login flow.
    }
  }
