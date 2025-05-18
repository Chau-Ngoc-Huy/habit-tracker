export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  habits: `${API_URL}/api/habits`,
  auth: `${API_URL}/api/auth`,
  users: `${API_URL}/api/users`,
}; 