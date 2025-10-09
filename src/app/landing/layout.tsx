
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
