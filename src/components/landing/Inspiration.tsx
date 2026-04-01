
'use client';

import Image from 'next/image';
import { imageCatalog } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';

export function Inspiration() {
  const inspirationImage = imageCatalog.inspirational[4];

  return (
    <section id="inspiration" className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="relative h-80 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
             <Image
                src={inspirationImage.imageUrl}
                alt={inspirationImage.description}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                data-ai-hint={inspirationImage.imageHint}
                unoptimized
            />
          </motion.div>
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
              Nossa Inspiração: Tecnologia com Axé
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Axénda nasceu da necessidade de uma ferramenta que não apenas organize nossas tarefas, mas que também celebre quem somos. Em um mundo que muitas vezes nos pede para acelerar e nos desconectar, propomos um caminho diferente: um de reconexão.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Acreditamos que a produtividade pode e deve caminhar lado a lado com nossos ciclos, nossa cultura e nossa ancestralidade. Este é um espaço para planejar o futuro, honrando o passado e vivendo plenamente o presente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
