import type { Task, CulturalEvent, Quote, KanbanColumn } from './types';

export const tasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Finalize project proposal',
    description: 'Review and finalize the Q3 project proposal for the Ubuntu Tech initiative.',
    category: 'Work',
    priority: 'High',
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    estimatedTime: 120,
    timeSpent: 45,
    status: 'In Progress',
    checklist: [
      { text: 'Draft initial proposal', completed: true },
      { text: 'Get feedback from team', completed: true },
      { text: 'Incorporate feedback', completed: false },
      { text: 'Final review', completed: false },
    ],
  },
  'task-2': {
    id: 'task-2',
    title: 'Study for exam',
    description: 'Prepare for the African History midterm.',
    category: 'Study',
    priority: 'Urgent',
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    estimatedTime: 240,
    timeSpent: 90,
    status: 'In Progress',
  },
  'task-3': {
    id: 'task-3',
    title: 'Morning meditation',
    category: 'Self-care',
    priority: 'Medium',
    timeSpent: 15,
    status: 'Done',
  },
  'task-4': {
    id: 'task-4',
    title: 'Brainstorm new art piece',
    category: 'Creation',
    priority: 'Low',
    timeSpent: 0,
    status: 'Todo',
  },
  'task-5': {
    id: 'task-5',
    title: 'Weekly grocery shopping',
    category: 'Personal',
    priority: 'Medium',
    timeSpent: 0,
    status: 'Todo',
  },
  'task-6': {
    id: 'task-6',
    title: 'Read a chapter of "The Water Dancer"',
    category: 'Self-care',
    priority: 'Low',
    timeSpent: 25,
    status: 'Done',
  },
};

export const columns: Record<string, KanbanColumn> = {
  'Todo': {
    id: 'Todo',
    title: 'To Do',
    taskIds: ['task-4', 'task-5'],
  },
  'In Progress': {
    id: 'In Progress',
    title: 'In Progress',
    taskIds: ['task-1', 'task-2'],
  },
  'Done': {
    id: 'Done',
    title: 'Done',
    taskIds: ['task-3', 'task-6'],
  },
};

export const columnOrder: ('Todo' | 'In Progress' | 'Done')[] = ['Todo', 'In Progress', 'Done'];

export const culturalEvents: CulturalEvent[] = [
  { date: '2024-11-20', title: 'Dia da Consciência Negra', description: 'Celebrates Black consciousness and resistance in Brazil.' },
  { date: '2024-07-25', title: 'Dia da Mulher Negra Latino-Americana e Caribenha', description: 'Honors the contributions and struggles of Black women in Latin America and the Caribbean.' },
  { date: '2024-05-13', title: 'Dia Nacional de Denúncia contra o Racismo', description: 'A day to denounce racism, marking the abolition of slavery in Brazil.' },
];

export const quotes: Quote[] = [
  { text: 'Se não nos movermos, não sentimos as correntes que nos prendem.', author: 'Rosa Luxemburgo (citada por Angela Davis)' },
  { text: 'Eu não sou aceitável. Eu sou inevitável.', author: 'James Baldwin' },
  { text: 'A revolução não será televisionada.', author: 'Gil Scott-Heron' },
  { text: 'A minha identidade não começa nem termina na ponta dos meus dedos.', author: 'Conceição Evaristo' },
  { text: 'Quando a mulher negra se movimenta, toda a estrutura da sociedade se movimenta com ela.', author: 'Angela Davis' },
  { text: 'Para nós, a questão da cor é uma questão política, não uma questão de preferência pessoal.', author: 'Lélia Gonzalez' },
];
