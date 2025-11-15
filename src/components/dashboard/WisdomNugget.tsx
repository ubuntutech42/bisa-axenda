
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { quotes } from '@/lib/data';
import type { Quote, ImagePlaceholder } from '@/lib/types';
import { imageCatalog } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

const selectImageForQuote = (quote: Quote): ImagePlaceholder => {
  const authorImages = imageCatalog.authors[quote.author];
  if (authorImages && authorImages.length > 0) {
    // Return a random image for that author
    return authorImages[Math.floor(Math.random() * authorImages.length)];
  }
  
  // Return a random image from the inspirational fallbacks
  return imageCatalog.inspirational[Math.floor(Math.random() * imageCatalog.inspirational.length)];
}

export function WisdomNugget() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [image, setImage] = useState<ImagePlaceholder | null>(null);
  const [googleSearchUrl, setGoogleSearchUrl] = useState('');

  useEffect(() => {
    // This logic runs only on the client to prevent hydration mismatch
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const selectedImage = selectImageForQuote(randomQuote);
    setQuote(randomQuote);
    setImage(selectedImage);
    setGoogleSearchUrl(`https://www.google.com/search?q=${encodeURIComponent(randomQuote.author)}`);
  }, []);

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
        <p className="text-right mt-2 text-sm text-muted-foreground">
            -{' '}
            <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-[#FFFFFF] transition-colors"
                onClick={(e) => e.stopPropagation()} // Prevents the card's click event if it had one
            >
                {quote.author}
            </a>
        </p>
      </CardContent>
    </Card>
  );
}
