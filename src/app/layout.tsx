
import type { Metadata } from 'next';
import { AppProviders } from '@/components/AppProviders';
import './globals.css';
import { inter, spaceGrotesk } from './fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Axénda',
  description: 'Sua agenda com axé. Organize sua rotina, celebre sua raiz.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable, spaceGrotesk.variable)}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
