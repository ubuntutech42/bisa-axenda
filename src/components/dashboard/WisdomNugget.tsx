"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { quotes } from '@/lib/data';
import type { Quote } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

export function WisdomNugget() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Moved the random quote selection inside useEffect to prevent hydration errors.
    // This ensures it only runs on the client-side.
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!quote) {
    // Render a placeholder or nothing while waiting for the client-side quote
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Frase do dia</h3>
                <div className="h-32 animate-pulse rounded-md bg-muted"></div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden group">
        <div className="absolute inset-0">
            <Image
                src={quote.imageUrl}
                alt={`Imagem de ${quote.author}`}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                data-ai-hint={quote.imageHint}
                unoptimized
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
        </div>
      <CardContent className="relative z-10 p-6 flex flex-col justify-end h-40">
        <h3 className="mb-2 text-sm font-semibold text-primary">Frase do dia</h3>
        <blockquote className="text-lg font-semibold text-primary-foreground italic border-l-4 border-primary pl-4">
          "{quote.text}"
        </blockquote>
        <p className="text-right mt-2 text-sm text-muted-foreground">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
