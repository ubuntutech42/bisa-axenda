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
        <Card className="bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground border-none">
            <CardContent className="p-6">
                <div className="h-12 animate-pulse rounded-md bg-white/20"></div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground border-none">
      <CardContent className="p-6">
        <blockquote className="text-lg font-semibold">
          "{quote.text}"
        </blockquote>
        <p className="text-right mt-2 text-sm opacity-80">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
