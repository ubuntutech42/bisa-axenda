"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { generateInsightsAction } from '@/app/actions';
import { tasks as allTasks } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AiInsights() {
  const [goals, setGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ insights: string; recommendations: string; } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!goals.trim()) {
      setError('Por favor, defina seus objetivos para obter insights personalizados.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setInsights(null);

    const taskData = Object.values(allTasks).map(({ title, category, timeSpent, deadline }) => ({
        title,
        category,
        timeSpent,
        deadline
    }));

    const result = await generateInsightsAction({ goals, tasks: taskData });
    
    setIsLoading(false);
    if (result.success && result.data) {
      setInsights(result.data);
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="text-accent" />
          Insights com IA
        </CardTitle>
        <CardDescription>
          Deixe nossa IA analisar seu progresso e agenda para fornecer recomendações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goals">Quais são seus principais objetivos para este período?</Label>
            <Textarea
              id="goals"
              placeholder="Ex: 'Passar em todas as provas', 'Lançar meu projeto paralelo', 'Priorizar meu bem-estar'"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Gerando...' : 'Gerar Insights'}
          </Button>
        </form>

        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isLoading && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-6 w-1/3 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}

        {insights && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Insights de Progresso</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{insights.insights}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Recomendações</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{insights.recommendations}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
