import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { FirebaseClientProvider } from '@/firebase';
import './globals.css';

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
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <div className="flex min-h-screen w-full bg-background">
            <div className="flex flex-col md:flex-row w-full">
              <Sidebar />
              <div className="flex flex-col flex-1">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
