
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Inspiration } from '@/components/landing/Inspiration';
import { CTA } from '@/components/landing/CTA';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <Features />
        <Inspiration />
        <CTA />
      </main>
    </div>
  );
}
