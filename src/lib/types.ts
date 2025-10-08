export type Category = 'Estudo' | 'Trabalho' | 'Autocuidado' | 'Criação' | 'Pessoal';

export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  deadline?: string;
  estimatedTime?: number; // in minutes
  timeSpent: number; // in minutes
  status: 'A Fazer' | 'Em Progresso' | 'Concluído';
  checklist?: { text: string; completed: boolean }[];
  comments?: string[];
}

export interface KanbanColumn {
  id: 'A Fazer' | 'Em Progresso' | 'Concluído';
  title: string;
  taskIds: string[];
}

export interface CulturalEvent {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
}

export interface Quote {
  text: string;
  author: string;
}
