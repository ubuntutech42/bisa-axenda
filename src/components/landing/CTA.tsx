
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="py-20 overflow-hidden relative">
      <div className="container mx-auto text-center px-4 relative z-10">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold font-headline text-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Pronto para organizar seu axé?
        </motion.h2>
        <motion.p 
          className="mt-4 text-lg max-w-xl mx-auto text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          Crie sua conta gratuitamente e comece a transformar sua rotina hoje mesmo.
        </motion.p>
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
          <Button size="lg" asChild>
            <Link href="/register">Comece Agora, é Grátis!</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
