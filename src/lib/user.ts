import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Creates a user profile document in Firestore.
 * @param user The Firebase Auth user object.
 * @param firestore The Firestore instance.
 */
export const createUserProfile = async (user: User, firestore?: Firestore) => {
  if (!user) throw new Error('User object is required.');
  
  // This is a bit of a hack. If firestore isn't passed, we are on the client
  // and need to dynamically import it to avoid server/client context issues.
  const db = firestore || (await import('@/firebase')).useFirestore();

  const userRef = doc(db, 'users', user.uid);
  
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
