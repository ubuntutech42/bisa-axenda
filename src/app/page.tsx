
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Inspiration } from '@/components/landing/Inspiration';
import { CTA } from '@/components/landing/CTA';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Inspiration />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
