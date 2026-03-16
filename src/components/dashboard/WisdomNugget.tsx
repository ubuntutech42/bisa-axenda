"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Quote } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useFirestore } from '@/firebase';
import { collection, query, limit, getDocs, orderBy, startAt, doc } from 'firebase/firestore';
import { DEFAULT_QUOTES } from '@/lib/default-quotes';

export function WisdomNugget() {
  const firestore = useFirestore();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleSearchUrl, setGoogleSearchUrl] = useState('');

  useEffect(() => {
    const fetchRandomQuote = async () => {
      if (!firestore) return;
      setIsLoading(true);

      try {
        // Generate a random ID to start the query from
        const randomId = doc(collection(firestore, 'quotes')).id;
        
        const q = query(
          collection(firestore, 'quotes'),
          orderBy('__name__'), // Order by document ID
          startAt(randomId),
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const randomQuote = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Quote;
          setQuote(randomQuote);
          setGoogleSearchUrl(`https://www.google.com/search?q=${encodeURIComponent(randomQuote.author)}`);
        } else {
          const secondQuery = query(collection(firestore, 'quotes'), limit(1));
          const secondSnapshot = await getDocs(secondQuery);
          if (!secondSnapshot.empty) {
            const fallbackQuote = { id: secondSnapshot.docs[0].id, ...secondSnapshot.docs[0].data() } as Quote;
            setQuote(fallbackQuote);
            setGoogleSearchUrl(`https://www.google.com/search?q=${encodeURIComponent(fallbackQuote.author)}`);
          } else {
            const defaultQuote = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
            setQuote({
              id: 'default',
              text: defaultQuote.text,
              author: defaultQuote.author,
              imageUrl: defaultQuote.imageUrl,
              createdAt: {} as Quote['createdAt'],
            });
            setGoogleSearchUrl(`https://www.google.com/search?q=${encodeURIComponent(defaultQuote.author)}`);
          }
        }
      } catch (error) {
        console.error("Error fetching random quote:", error);
        const defaultQuote = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
        setQuote({
          id: 'default',
          text: defaultQuote.text,
          author: defaultQuote.author,
          imageUrl: defaultQuote.imageUrl,
          createdAt: {} as Quote['createdAt'],
        });
        setGoogleSearchUrl(`https://www.google.com/search?q=${encodeURIComponent(defaultQuote.author)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomQuote();
  }, [firestore]);


  if (isLoading || !quote) {
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
    <Card className="relative overflow-hidden group h-40 md:h-48 flex flex-col justify-end">
        <div className="absolute inset-0">
            <Image
                src={quote.imageUrl}
                alt={`Imagem de ${quote.author}`}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                unoptimized
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
        </div>
      <CardContent className="relative z-10 p-4 md:p-6">
        <h3 className="mb-2 text-xs md:text-sm font-semibold text-primary">Frase do dia</h3>
        <blockquote className="text-base md:text-lg font-semibold text-primary-foreground italic border-l-4 border-primary pl-3 md:pl-4">
          "{quote.text}"
        </blockquote>
        <p className="text-right mt-2 text-xs md:text-sm text-muted-foreground">
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
