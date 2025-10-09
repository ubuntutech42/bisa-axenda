import type { Timestamp } from 'firebase/firestore';

export type Category = 'Estudo' | 'Trabalho' | 'Autocuidado' | 'Criação' | 'Pessoal';

export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface Task {
  id: string;
  userId: string;
  listId: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  deadline?: string;
  estimatedTime?: number; // in minutes
  timeSpent: number; // in minutes
  checklist?: { text: string; completed: boolean }[];
  comments?: string[];
}

export interface KanbanBoard {
  id: string;
  userId: string;
  name: string;
  type: 'kanban' | 'swot' | 'business_canvas';
  createdAt: Timestamp;
}

export interface KanbanList {
  id: string;
  name: string;
  order: number;
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

export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface AuthorImages {
  [author: string]: ImagePlaceholder[];
}

export interface ImageCatalog {
  authors: AuthorImages;
  inspirational: ImagePlaceholder[];
}


export interface PomodoroSession {
  id: string;
  userId: string;
  kanbanCardId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  focusDuration: number;
  category: string;
}
