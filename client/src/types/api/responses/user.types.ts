import { Task } from "./task.types";

export interface User {
    id: string;
    name: string;
    tasks: Record<string, Task[]>;
    streak: number;
    avatarURL?: string;  // Optional avatar URL field
}