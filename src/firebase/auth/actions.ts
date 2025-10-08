'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

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

    // Update user profile
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        userName: name,
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        profileImageUrl: user.photoURL || '',
    }, { merge: true });

    return { uid: user.uid, email: user.email };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Sign in with email and password
export async function signin(email: string, password: string) {
  const { auth } = getFirebaseServices();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Customize error messages for better user experience
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('E-mail ou senha inválidos.');
    }
    throw new Error('Ocorreu um erro ao tentar fazer login.');
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
