export type Category = 'Study' | 'Work' | 'Self-care' | 'Creation' | 'Personal';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  deadline?: string;
  estimatedTime?: number; // in minutes
  timeSpent: number; // in minutes
  status: 'Todo' | 'In Progress' | 'Done';
  checklist?: { text: string; completed: boolean }[];
  comments?: string[];
}

export interface KanbanColumn {
  id: 'Todo' | 'In Progress' | 'Done';
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
