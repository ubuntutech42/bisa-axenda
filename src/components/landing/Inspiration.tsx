
import Image from 'next/image';
import { imageCatalog } from '@/lib/placeholder-images';

export function Inspiration() {
  const inspirationImage = imageCatalog.inspirational[4];

  return (
    <section id="inspiration" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 rounded-lg overflow-hidden">
             <Image
                src={inspirationImage.imageUrl}
                alt={inspirationImage.description}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                data-ai-hint={inspirationImage.imageHint}
                unoptimized
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
              Nossa Inspiração: Tecnologia com Axé
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Axénda nasceu da necessidade de uma ferramenta que não apenas organize nossas tarefas, mas que também celebre quem somos. Em um mundo que muitas vezes nos pede para acelerar e nos desconectar, propomos um caminho diferente: um de reconexão.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Acreditamos que a produtividade pode e deve caminhar lado a lado com nossos ciclos, nossa cultura e nossa ancestralidade. Este é um espaço para planejar o futuro, honrando o passado e vivendo plenamente o presente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
