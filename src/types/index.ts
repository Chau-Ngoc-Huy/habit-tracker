export interface Task {
  id: number;
  name: string;
  completed: boolean;
}

export interface User {
  name: string;
  tasks: Record<string, Task[]>;
  streak: number;
}

export type FilterType = 'all' | 'pending' | 'completed'; 