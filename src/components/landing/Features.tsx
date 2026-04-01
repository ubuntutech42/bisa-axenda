
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutGrid, Timer, CalendarDays, BrainCircuit, Sparkles, Moon } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const features = [
  {
    icon: <LayoutGrid className="w-8 h-8 text-primary" />,
    title: 'Quadros Kanban Flexíveis',
    description: 'Organize suas tarefas, projetos e ideias com modelos de quadros como Kanban, SWOT e Canvas de Negócios.',
  },
  {
    icon: <CalendarDays className="w-8 h-8 text-primary" />,
    title: 'Calendário Ancestral',
    description: 'Conecte-se com datas importantes da cultura afro-brasileira e adicione seus próprios eventos e ciclos.',
  },
  {
    icon: <Timer className="w-8 h-8 text-primary" />,
    title: 'Foco com Pomodoro',
    description: 'Aumente sua produtividade com um timer Pomodoro integrado, personalizável e ligado às suas tarefas.',
  },
    {
    icon: <Moon className="w-8 h-8 text-primary" />,
    title: 'Ciclos Lunares',
    description: 'Acompanhe as fases da lua e receba insights sobre como cada ciclo influencia sua energia e produtividade.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: 'Relatórios Inteligentes',
    description: 'Visualize como seu tempo é distribuído e receba insights de IA para otimizar sua rotina e alcançar seus objetivos.',
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: 'Relíquias de Sabedoria',
    description: 'Comece seu dia com citações inspiradoras de grandes pensadores e figuras proeminentes da história negra.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Um espaço para florescer</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
            Todas as ferramentas que você precisa para cultivar uma rotina com propósito.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="flex flex-col items-center text-center p-6 h-full hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardDescription className="mt-2 text-base">
                  {feature.description}
                </CardDescription>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
