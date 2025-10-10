import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Creates a user profile document in Firestore.
 * @param user The Firebase Auth user object.
 * @param firestore The Firestore instance.
 */
export const createUserProfile = async (user: User, firestore: Firestore) => {
  if (!user) throw new Error('User object is required.');
  if (!firestore) throw new Error('Firestore instance is required.');
  
  const userRef = doc(firestore, 'users', user.uid);
  
  const displayName = user.displayName || 'Usuário Axénda';
  const firstName = displayName.split(' ')[0] || '';
  const lastName = displayName.split(' ').slice(1).join(' ') || '';

  const userData = {
    id: user.uid,
    email: user.email,
    userName: displayName,
    firstName: firstName,
    lastName: lastName,
    profileImageUrl: user.photoURL || '',
  };

  await setDoc(userRef, userData, { merge: true });
};
