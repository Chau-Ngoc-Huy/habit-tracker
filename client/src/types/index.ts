export interface Task {
  id: number | string;  // Allow both number (local) and string (Supabase) IDs
  name: string;
  completed: boolean;
  date?: string;  // Optional date property
}

export interface User {
  id: string;
  name: string;
  tasks: Record<string, Task[]>;
  streak: number;
}

export type FilterType = 'all' | 'pending' | 'completed'; 