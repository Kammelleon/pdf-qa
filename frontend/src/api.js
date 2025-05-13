import axios from 'axios';
import { API_BASE_URL, DEFAULT_TIMEOUT } from './settings';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

export default api;