import type { Task, CulturalEvent, Quote, KanbanColumn } from './types';

export const tasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Finalizar proposta do projeto',
    description: 'Revisar e finalizar a proposta do projeto do 3º trimestre para a iniciativa de tecnologia Ubuntu.',
    category: 'Trabalho',
    priority: 'Alta',
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    estimatedTime: 120,
    timeSpent: 45,
    status: 'Em Progresso',
    checklist: [
      { text: 'Esboçar proposta inicial', completed: true },
      { text: 'Obter feedback da equipe', completed: true },
      { text: 'Incorporar feedback', completed: false },
      { text: 'Revisão final', completed: false },
    ],
  },
  'task-2': {
    id: 'task-2',
    title: 'Estudar para a prova',
    description: 'Preparar para a prova de História Africana.',
    category: 'Estudo',
    priority: 'Urgente',
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    estimatedTime: 240,
    timeSpent: 90,
    status: 'Em Progresso',
  },
  'task-3': {
    id: 'task-3',
    title: 'Meditação matinal',
    category: 'Autocuidado',
    priority: 'Média',
    timeSpent: 15,
    status: 'Concluído',
  },
  'task-4': {
    id: 'task-4',
    title: 'Brainstorm para nova peça de arte',
    category: 'Criação',
    priority: 'Baixa',
    timeSpent: 0,
    status: 'A Fazer',
  },
  'task-5': {
    id: 'task-5',
    title: 'Compras semanais',
    category: 'Pessoal',
    priority: 'Média',
    timeSpent: 0,
    status: 'A Fazer',
  },
  'task-6': {
    id: 'task-6',
    title: 'Ler um capítulo de "A Dança da Água"',
    category: 'Autocuidado',
    priority: 'Baixa',
    timeSpent: 25,
    status: 'Concluído',
  },
};

export const columns: Record<string, KanbanColumn> = {
  'A Fazer': {
    id: 'A Fazer',
    title: 'A Fazer',
    taskIds: ['task-4', 'task-5'],
  },
  'Em Progresso': {
    id: 'Em Progresso',
    title: 'Em Progresso',
    taskIds: ['task-1', 'task-2'],
  },
  'Concluído': {
    id: 'Concluído',
    title: 'Concluído',
    taskIds: ['task-3', 'task-6'],
  },
};

export const columnOrder: ('A Fazer' | 'Em Progresso' | 'Concluído')[] = ['A Fazer', 'Em Progresso', 'Concluído'];

export const culturalEvents: CulturalEvent[] = [
  { date: '2024-01-01', title: 'Confraternização Universal', description: 'Feriado nacional.' },
  { date: '2024-02-12', title: 'Carnaval', description: 'Ponto facultativo.' },
  { date: '2024-02-13', title: 'Carnaval', description: 'Ponto facultativo.' },
  { date: '2024-02-14', title: 'Quarta-feira de Cinzas', description: 'Ponto facultativo até às 14h.' },
  { date: '2024-03-29', title: 'Paixão de Cristo', description: 'Feriado nacional.' },
  { date: '2024-04-21', title: 'Tiradentes', description: 'Feriado nacional.' },
  { date: '2024-05-01', title: 'Dia do Trabalho', description: 'Feriado nacional.' },
  { date: '2024-05-13', title: 'Dia Nacional de Denúncia contra o Racismo', description: 'Dia para denunciar o racismo, marcando a abolição da escravatura no Brasil.' },
  { date: '2024-05-30', title: 'Corpus Christi', description: 'Ponto facultativo.' },
  { date: '2024-07-25', title: 'Dia da Mulher Negra Latino-Americana e Caribenha', description: 'Homenageia as contribuições e lutas das mulheres negras na América Latina e no Caribe.' },
  { date: '2024-09-07', title: 'Independência do Brasil', description: 'Feriado nacional.' },
  { date: '2024-10-12', title: 'Nossa Senhora Aparecida', description: 'Feriado nacional.' },
  { date: '2024-10-28', title: 'Dia do Servidor Público', description: 'Ponto facultativo.' },
  { date: '2024-11-02', title: 'Finados', description: 'Feriado nacional.' },
  { date: '2024-11-15', title: 'Proclamação da República', description: 'Feriado nacional.' },
  { date: '2024-11-20', title: 'Dia da Consciência Negra', description: 'Celebra a consciência e resistência negra no Brasil.' },
  { date: '2024-12-25', title: 'Natal', description: 'Feriado nacional.' },
];

export const quotes: Quote[] = [
  { text: 'Se não nos movermos, não sentimos as correntes que nos prendem.', author: 'Rosa Luxemburgo (citada por Angela Davis)' },
  { text: 'Eu não sou aceitável. Eu sou inevitável.', author: 'James Baldwin' },
  { text: 'A revolução não será televisionada.', author: 'Gil Scott-Heron' },
  { text: 'A minha identidade não começa nem termina na ponta dos meus dedos.', author: 'Conceição Evaristo' },
  { text: 'Quando a mulher negra se movimenta, toda a estrutura da sociedade se movimenta com ela.', author: 'Angela Davis' },
  { text: 'Para nós, a questão da cor é uma questão política, não uma questão de preferência pessoal.', author: 'Lélia Gonzalez' },
];
