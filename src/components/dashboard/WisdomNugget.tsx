"use client";

import { useState, useEffect } from 'react';
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
                <div className="h-16 animate-pulse rounded-md bg-muted"></div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Frase do dia</h3>
        <blockquote className="text-lg font-semibold text-foreground italic border-l-4 border-primary pl-4">
          "{quote.text}"
        </blockquote>
        <p className="text-right mt-2 text-sm text-muted-foreground">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
