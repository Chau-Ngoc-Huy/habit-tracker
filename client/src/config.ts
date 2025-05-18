// Configuration for API client selection
export const USE_MOCK_API = process.env.USE_MOCK_API === 'true' || false; // Default to true for now

// API base URL for real backend
export const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api'; 