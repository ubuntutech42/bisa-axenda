"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { quotes } from '@/lib/data';
import type { Quote } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

export function WisdomNugget() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Moved the random quote selection inside useEffect to prevent hydration errors.
    // This ensures it only runs on the client-side.
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const image = useMemo(() => {
    if (!quote) return null;
    return PlaceHolderImages.find(img => img.id === quote.imageId);
  }, [quote]);

  if (!quote || !image) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="mb-2 text-sm font-semibold text-primary">Frase do dia</h3>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 ml-auto" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden group h-48 flex flex-col justify-end">
        <div className="absolute inset-0">
            <Image
                src={image.imageUrl}
                alt={`Imagem de ${quote.author}`}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                data-ai-hint={image.imageHint}
                unoptimized
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
        </div>
      <CardContent className="relative z-10 p-6">
        <h3 className="mb-2 text-sm font-semibold text-primary">Frase do dia</h3>
        <blockquote className="text-lg font-semibold text-primary-foreground italic border-l-4 border-primary pl-4">
          "{quote.text}"
        </blockquote>
        <p className="text-right mt-2 text-sm text-muted-foreground">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
