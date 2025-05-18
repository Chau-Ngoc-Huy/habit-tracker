import { API_BASE_URL } from '../config/config';
import { hashPassword, verifyPassword } from './authUtils';

// Type definitions
export type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at?: string;
  streak: number;
};

export type Task = {
  id: string | number;
  user_id?: string;
  name: string;
  completed: boolean;
  date?: string;
  created_at?: string;
};

export type StreakResponse = {
  streak: number;
  user_id: string;
};

// API functions
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  return handleResponse<User[]>(response);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return handleResponse<User>(response);
};

export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  const password_hash = await hashPassword(password);
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password_hash, streak: 0 }),
  });
  return handleResponse<User>(response);
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<User>(response);
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  return handleResponse<Task[]>(response);
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks?user_id=${userId}`);
  return handleResponse<Task[]>(response);
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
};

export const updateTask = async (id: string | number, taskData: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse<Task>(response);
};

export const deleteTask = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};

export const getUserStreak = async (userId: string): Promise<StreakResponse> => {
  const response = await fetch(`${API_BASE_URL}/tasks/streak/${userId}`);
  return handleResponse<StreakResponse>(response);
};

export const deleteFrozenTasks = async (userId: string, date: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/frozen?user_id=${userId}&date=${date}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete frozen tasks');
  }
};

export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return null;
  }

  return handleResponse<User>(response);
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
} 