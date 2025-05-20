export interface Task {
    id: number | string;  // Allow both number (local) and string (Supabase) IDs
    name: string;
    completed: boolean;
    date?: string;  // Optional date property
}