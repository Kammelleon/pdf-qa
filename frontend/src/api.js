import axios from 'axios';
import { DEFAULT_TIMEOUT } from './settings';

const api = axios.create({
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

export default api;