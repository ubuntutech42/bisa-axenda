
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutGrid, Timer, CalendarDays, BrainCircuit, Sparkles, Moon } from 'lucide-react';

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

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Um espaço para florescer</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
            Todas as ferramentas que você precisa para cultivar uma rotina com propósito.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6">
              <div className="mb-4">{feature.icon}</div>
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2 text-base">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
