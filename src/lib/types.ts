

import type { Timestamp } from 'firebase/firestore';

export interface User {
    id: string;
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    age?: number;
    gender?: string;
    bio?: string;
}

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
  createdAt: Timestamp;
}

export interface KanbanBoard {
  id: string;
  userId: string;
  name: string;
  group?: string;
  type: 'kanban' | 'swot' | 'business_canvas' | 'goal_setting' | 'custom' | 'weekly_reflection';
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
  type: 'cultural' | 'comercial';
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

export interface CalendarEventCategory {
  id: string; // For user-created, this is the doc ID. For native, it's the name.
  userId?: string; // Only present for user-created categories
  name: string;
  color: string;
  isNative?: boolean; // Flag to identify native categories
  createdAt?: Timestamp; // Only for user-created
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  categoryId: string; // This will be the 'id' from CalendarEventCategory
  createdAt: Timestamp;
}

export type LunarPhaseName = 
  | "Lua Nova" 
  | "Lua Crescente Côncava"
  | "Quarto Crescente" 
  | "Lua Crescente Gibosa" 
  | "Lua Cheia" 
  | "Lua Minguante Gibosa" 
  | "Quarto Minguante" 
  | "Lua Minguante Côncava";

export interface LunarPhase {
    id: string;
    date: string;
    phaseName: LunarPhaseName;
    description: string;
    svg: string;
}

export interface LunarDataResponse {
    phase: {
        [day: string]: {
            phaseName: string;
            svg: string;
            svgDescription: string;
        }
    }
}
