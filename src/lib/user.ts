import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Creates a user profile document in Firestore if it doesn't exist.
 * @param user The Firebase Auth user object.
 * @param firestore The Firestore instance.
 * @param additionalData Optional additional data to merge into the profile.
 */
export const createUserProfile = async (user: User, firestore: Firestore, additionalData: Record<string, any> = {}) => {
  if (!user) throw new Error('User object is required.');
  if (!firestore) throw new Error('Firestore instance is required.');
  
  const userRef = doc(firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const displayName = user.displayName || 'Usuário Axénda';
    const firstName = user.displayName?.split(' ')[0] || '';
    const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';

    const userData = {
      id: user.uid,
      email: user.email,
      userName: displayName,
      firstName: firstName,
      lastName: lastName,
      profileImageUrl: user.photoURL || '',
      ...additionalData,
    };
    
    await setDoc(userRef, userData, { merge: true });
  } else {
    // If user exists, maybe just update specific fields from auth if needed
    const existingData = userSnap.data();
    const updates: Record<string, any> = {};
    if (!existingData.profileImageUrl && user.photoURL) {
      updates.profileImageUrl = user.photoURL;
    }
    if (!existingData.userName && user.displayName) {
      updates.userName = user.displayName;
    }
    if (Object.keys(updates).length > 0) {
      await setDoc(userRef, updates, { merge: true });
    }
  }
};
