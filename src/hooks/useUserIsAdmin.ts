'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { userIsAdmin } from '@/lib/admin';

/**
 * Resolve se o usuário atual é admin (UID legado ou custom claim `admin`).
 * `isCheckingAdmin` fica true até o primeiro `getIdTokenResult` concluir.
 */
export function useUserIsAdmin() {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }
    let cancelled = false;
    setIsCheckingAdmin(true);
    void userIsAdmin(user).then((admin) => {
      if (!cancelled) {
        setIsAdmin(admin);
        setIsCheckingAdmin(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, isUserLoading]);

  return {
    isAdmin,
    isCheckingAdmin: isUserLoading || (!!user && isCheckingAdmin),
  };
}
