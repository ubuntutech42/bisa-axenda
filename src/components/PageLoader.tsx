'use client';

import { Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loader exibido na área de conteúdo durante a transição entre páginas.
 * Melhora a percepção de velocidade da navegação.
 */
export function PageLoader() {
  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-150">
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
      <div className="space-y-4 px-1">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
