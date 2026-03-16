'use client';

import { useEffect } from 'react';
import { collection, doc, writeBatch, getDocs, query, limit } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { culturalEvents, quotes } from '@/lib/data';
import { DEFAULT_QUOTES } from '@/lib/default-quotes';

interface DataMigrationProps {
  firestore: Firestore | null;
  userId: string | null;
}

/**
 * Executa migrações one-time para Firestore (quotes, culturalEvents, seed de frases).
 */
export function DataMigration({ firestore, userId }: DataMigrationProps) {
  useEffect(() => {
    if (!firestore || !userId) return;

    const runMigrations = async () => {
      // #region agent log
      const t0 = Date.now();
      if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'DataMigration.tsx:runMigrations start',message:'DataMigration runMigrations start',data:{t:t0},timestamp:t0,hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const batch = writeBatch(firestore);

      const migrationStatus = localStorage.getItem('axenda_migration_v1');
      if (migrationStatus !== 'completed' && (quotes.length > 0 || culturalEvents.length > 0)) {
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
      }

      const seedQuotesStatus = localStorage.getItem('axenda_seed_quotes_v1');
      if (seedQuotesStatus !== 'completed') {
        try {
          const quotesSnap = await getDocs(query(collection(firestore, 'quotes'), limit(1)));
          if (quotesSnap.empty && DEFAULT_QUOTES.length > 0) {
            const seedBatch = writeBatch(firestore);
            const quotesCol = collection(firestore, 'quotes');
            DEFAULT_QUOTES.forEach((q) => {
              const docRef = doc(quotesCol);
              seedBatch.set(docRef, { ...q, createdAt: new Date() });
            });
            await seedBatch.commit();
            localStorage.setItem('axenda_seed_quotes_v1', 'completed');
          } else if (!quotesSnap.empty) {
            localStorage.setItem('axenda_seed_quotes_v1', 'completed');
          }
        } catch (error) {
          console.error('Seed quotes error:', error);
        }
      }
      // #region agent log
      if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7478/ingest/67b52dda-7cfc-4e99-9fbb-9d237c3be7a6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'80706c'},body:JSON.stringify({sessionId:'80706c',location:'DataMigration.tsx:runMigrations end',message:'DataMigration runMigrations end',data:{t:Date.now(),elapsed:Date.now()-t0},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    };

    runMigrations();
  }, [firestore, userId]);

  return null;
}
