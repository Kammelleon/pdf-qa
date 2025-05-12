// Backend API Configuration
export const API_HOST = import.meta.env.VITE_API_HOST || 'localhost';
export const API_PORT = import.meta.env.VITE_API_PORT || '8000';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_TIMEOUT = 60000; // 60 seconds
