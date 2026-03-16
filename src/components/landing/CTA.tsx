
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
          Pronto para organizar seu axé?
        </h2>
        <p className="mt-4 text-lg max-w-xl mx-auto text-muted-foreground">
          Crie sua conta gratuitamente e comece a transformar sua rotina hoje mesmo.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/register">Comece Agora, é Grátis!</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
