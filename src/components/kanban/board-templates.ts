import type { KanbanBoard } from '@/lib/types';

export const boardTemplates: Record<KanbanBoard['type'], { name: string; order: number }[]> = {
  kanban: [
    { name: 'Backlog', order: 0 },
    { name: 'A Fazer', order: 1 },
    { name: 'Em Progresso', order: 2 },
    { name: 'Revisão', order: 3 },
    { name: 'Concluído', order: 4 },
  ],
  swot: [
    { name: 'Forças (Strengths)', order: 0 },
    { name: 'Fraquezas (Weaknesses)', order: 1 },
    { name: 'Oportunidades (Opportunities)', order: 2 },
    { name: 'Ameaças (Threats)', order: 3 },
  ],
  business_canvas: [
      { name: 'Parcerias Chave', order: 0 },
      { name: 'Atividades Chave', order: 1 },
      { name: 'Recursos Chave', order: 2 },
      { name: 'Proposta de Valor', order: 3 },
      { name: 'Relacionamento com Clientes', order: 4 },
      { name: 'Canais', order: 5 },
      { name: 'Segmentos de Clientes', order: 6 },
      { name: 'Estrutura de Custos', order: 7 },
      { name: 'Fontes de Receita', order: 8 },
  ],
  goal_setting: [
    { name: 'Intenções / Objetivos', order: 0 },
    { name: 'Próximos Passos', order: 1 },
    { name: 'Em Andamento', order: 2 },
    { name: 'Pausado / Revisando', order: 3 },
    { name: 'Concluído / Celebrar!', order: 4 },
  ],
  custom: [],
};

export const boardTemplatesInfo: {type: KanbanBoard['type'], name: string, description: string}[] = [
    { type: 'kanban', name: 'Kanban Padrão', description: 'Para gerenciamento de fluxo de trabalho (A Fazer, Em Progresso, Concluído).' },
    { type: 'goal_setting', name: 'Quadro de Intenções', description: 'Para definir e acompanhar objetivos e como você quer se sentir durante o processo.' },
    { type: 'swot', name: 'Análise SWOT (FOFA)', description: 'Para análise estratégica (Forças, Fraquezas, Oportunidades, Ameaças).' },
    { type: 'business_canvas', name: 'Canvas de Negócio', description: 'Para modelagem de negócios e planejamento estratégico.' },
    { type: 'custom', name: 'Personalizado', description: 'Comece com um quadro em branco e adicione suas próprias colunas.' },
]
