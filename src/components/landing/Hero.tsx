
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto text-center px-4">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold font-headline text-foreground leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Organize sua rotina.
          <br />
          <span className="text-primary">Celebre sua raiz.</span>
        </motion.h1>
        <motion.p 
          className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Axénda é a sua agenda com axé. Uma ferramenta para organizar suas tarefas, honrar seus ciclos e se conectar com sua ancestralidade.
        </motion.p>
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <Button size="lg" asChild>
            <Link href="/register">Começar Agora</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
