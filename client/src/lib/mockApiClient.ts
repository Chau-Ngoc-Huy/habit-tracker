import { hashPassword, verifyPassword } from './authUtils';
import { StreakResponse } from './apiClient';

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

// In-memory storage
const mockStorage = {
  users: new Map<string, User>(),
  tasks: new Map<string | number, Task>(),
  nextTaskId: 1
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// User API functions
export const getUsers = async (): Promise<User[]> => {
  await delay(300); // Simulate network delay
  return Array.from(mockStorage.users.values());
};

export const getUserById = async (id: string): Promise<User | null> => {
  await delay(300);
  return mockStorage.users.get(id) || null;
};

export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  await delay(300);
  const password_hash = await hashPassword(password);
  const newUser: User = {
    id: generateId(),
    name,
    email,
    password_hash,
    streak: 0,
    created_at: new Date().toISOString()
  };
  mockStorage.users.set(newUser.id, newUser);
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  await delay(300);
  const existingUser = mockStorage.users.get(id);
  if (!existingUser) {
    // If user doesn't exist, create them with default values
    const newUser: User = {
      id,
      name: userData.name || 'New User',
      email: userData.email || '',
      password_hash: userData.password_hash || '',
      streak: userData.streak || 0,
      created_at: new Date().toISOString()
    };
    mockStorage.users.set(id, newUser);
    return newUser;
  }
  const updatedUser = { ...existingUser, ...userData };
  mockStorage.users.set(id, updatedUser);
  return updatedUser;
};

// Add a new function to verify user credentials
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  await delay(300);
  const users = Array.from(mockStorage.users.values());
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  const isValid = await verifyPassword(password, user.password_hash);
  return isValid ? user : null;
};

// Task API functions
export const getTasks = async (): Promise<Task[]> => {
  await delay(300);
  return Array.from(mockStorage.tasks.values());
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  await delay(300);
  return Array.from(mockStorage.tasks.values())
    .filter(task => task.user_id === userId);
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
  await delay(300);
  
  // Ensure user exists
  if (task.user_id) {
    const user = mockStorage.users.get(task.user_id);
    if (!user) {
      // Create user if they don't exist
      await createUser('New User', '', '');
    }
  }
  
  const newTask: Task = {
    ...task,
    id: mockStorage.nextTaskId++,
    created_at: new Date().toISOString()
  };
  mockStorage.tasks.set(newTask.id, newTask);
  return newTask;
};

export const updateTask = async (id: string | number, taskData: Partial<Task>): Promise<Task> => {
  await delay(300);
  const existingTask = mockStorage.tasks.get(id);
  if (!existingTask) {
    throw new Error('Task not found');
  }
  const updatedTask = { ...existingTask, ...taskData };
  mockStorage.tasks.set(id, updatedTask);
  return updatedTask;
};

export const deleteTask = async (id: string | number): Promise<void> => {
  await delay(300);
  if (!mockStorage.tasks.has(id)) {
    throw new Error('Task not found');
  }
  mockStorage.tasks.delete(id);
};

// Helper function to reset mock storage (useful for testing)
export const resetMockStorage = (): void => {
  mockStorage.users.clear();
  mockStorage.tasks.clear();
  mockStorage.nextTaskId = 1;
};

// Helper function to seed mock data (useful for testing)
export const seedMockData = (): void => {
  // Reset storage first
  resetMockStorage();

  // Create test users
  const testUsers = [
    {
      id: 'test_user_1',
      name: 'Test User 1',
      email: 'test1@example.com',
      password_hash: '$2a$10$X7UrH5X5X5X5X5X5X5X5X.5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', // hashed 'password123'
      streak: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 'test_user_2',
      name: 'Test User 2',
      email: 'test2@example.com',
      password_hash: '$2a$10$X7UrH5X5X5X5X5X5X5X5X.5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', // hashed 'password123'
      streak: 1,
      created_at: new Date().toISOString()
    }
  ];

  testUsers.forEach(user => {
    mockStorage.users.set(user.id, user);
  });

  // Create test tasks
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

  const tasks = [
    // Tasks for user 1
    {
      id: 1,
      user_id: 'test_user_1',
      name: 'Complete project documentation',
      completed: true,
      date: today,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 'test_user_1',
      name: 'Review pull requests',
      completed: false,
      date: today,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: 'test_user_1',
      name: 'Team meeting',
      completed: true,
      date: yesterday,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      user_id: 'test_user_1',
      name: 'Code review',
      completed: true,
      date: twoDaysAgo,
      created_at: new Date().toISOString()
    },
    // Tasks for user 2
    {
      id: 5,
      user_id: 'test_user_2',
      name: 'Update README',
      completed: true,
      date: today,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      user_id: 'test_user_2',
      name: 'Fix bugs',
      completed: false,
      date: today,
      created_at: new Date().toISOString()
    }
  ];

  tasks.forEach(task => {
    mockStorage.tasks.set(task.id, task);
  });
  mockStorage.nextTaskId = tasks.length + 1;
};

// Seed mock data when the module is loaded
seedMockData();

export const getUserStreak = async (userId: string): Promise<StreakResponse> => {
  await delay(300);
  const user = mockStorage.users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return {
    streak: user.streak,
    user_id: userId
  };
}; 