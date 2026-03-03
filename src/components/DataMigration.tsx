'use client';

import { useEffect } from 'react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { culturalEvents, quotes } from '@/lib/data';

interface DataMigrationProps {
  firestore: Firestore | null;
  userId: string | null;
}

/**
 * Executa a migração one-time de quotes e culturalEvents para Firestore.
 * Renderiza nada; roda em background quando firestore e user estão disponíveis.
 */
export function DataMigration({ firestore, userId }: DataMigrationProps) {
  useEffect(() => {
    if (!firestore || !userId) return;

    const runMigration = async () => {
      const migrationStatus = localStorage.getItem('axenda_migration_v1');
      if (migrationStatus === 'completed') return;
      if (quotes.length === 0 && culturalEvents.length === 0) return;

      const batch = writeBatch(firestore);

      if (quotes.length > 0) {
        const quotesCol = collection(firestore, 'quotes');
        quotes.forEach((quote) => {
          const docRef = doc(quotesCol);
          batch.set(docRef, { ...quote, createdAt: new Date() });
        });
      }

      if (culturalEvents.length > 0) {
        const eventsCol = collection(firestore, 'culturalEvents');
        culturalEvents.forEach((event) => {
          const docRef = doc(eventsCol);
          batch.set(docRef, { ...event, createdAt: new Date() });
        });
      }

      try {
        await batch.commit();
        localStorage.setItem('axenda_migration_v1', 'completed');
      } catch (error) {
        console.error('Data migration error:', error);
      }
    };

    runMigration();
  }, [firestore, userId]);

  return null;
}
