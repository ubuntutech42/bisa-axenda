
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Inspiration } from '@/components/landing/Inspiration';
import { CTA } from '@/components/landing/CTA';
import LandingLayout from './landing/layout';

export default function HomePage() {
  return (
    <LandingLayout>
      <Hero />
      <Features />
      <Inspiration />
      <CTA />
    </LandingLayout>
  );
}
