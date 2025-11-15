
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { CalendarEventCategory, Category } from '@/lib/types';
import { NATIVE_CATEGORIES } from '@/lib/constants';

/**
 * A hook to get all calendar event categories, merging native/default ones
 * with user-specific ones from Firestore.
 */
export const useCategories = () => {
  const { user } = useUser();
  const firestore = useFirestore();

  const userCategoriesQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'eventCategories')) : null),
    [firestore, user]
  );

  const { data: userCategories, isLoading } = useCollection<CalendarEventCategory>(userCategoriesQuery);

  const allCategories = useMemo(() => {
    // Create a map of native categories for easy lookup
    const nativeCategoriesMap = new Map(NATIVE_CATEGORIES.map(c => [c.id, c]));

    // If user has overrides in Firestore, apply them
    if (userCategories) {
      userCategories.forEach(userCat => {
        if (nativeCategoriesMap.has(userCat.id)) {
          // It's an override for a native category (e.g., color change)
          const nativeCat = nativeCategoriesMap.get(userCat.id)!;
          nativeCategoriesMap.set(userCat.id, { ...nativeCat, color: userCat.color });
        }
      });
    }

    const finalNativeCategories = Array.from(nativeCategoriesMap.values());
    const finalUserCategories = userCategories?.filter(c => !c.isNative) || [];
    
    return [...finalNativeCategories, ...finalUserCategories].sort((a,b) => a.name.localeCompare(b.name));

  }, [userCategories]);


  const categoriesMap = useMemo(() => {
     return new Map(allCategories.map(cat => [cat.id, cat]));
  }, [allCategories]);

  const justUserCategories = useMemo(() => {
    return userCategories?.filter(c => !c.isNative) || [];
  }, [userCategories])

  const nativeCategoriesWithOverrides = useMemo(() => {
    return allCategories.filter(c => c.isNative);
  }, [allCategories]);

  return { 
    allCategories, 
    nativeCategories: nativeCategoriesWithOverrides, 
    userCategories: justUserCategories,
    categoriesMap, 
    isLoading 
  };
};
