import axios from 'axios';
import { API_BASE_URL, DEFAULT_TIMEOUT } from './settings';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Dodane w celu lepszej obsługi CORS
  withCredentials: false
});

// Dodajemy interceptory dla lepszej diagnostyki
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method, config.url);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status);
    return response;
  },
  error => {
    if (error.response) {
      console.error('Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No Response:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;