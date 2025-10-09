
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground leading-tight">
          Organize sua rotina.
          <br />
          <span className="text-primary">Celebre sua raiz.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
          Axénda é a sua agenda com axé. Uma ferramenta para organizar suas tarefas, honrar seus ciclos e se conectar com sua ancestralidade.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/register">Começar Agora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
