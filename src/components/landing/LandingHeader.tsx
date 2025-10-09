
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    </header>
  );
}
