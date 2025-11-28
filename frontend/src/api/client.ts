import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Vite proxy handles /api requests to backend
const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const wordlistAPI = {
  getAll: () => api.get('/wordlists'),
  getById: (id: number) => api.get(`/wordlists/${id}`),
  create: (title: string, description: string) =>
    api.post('/wordlists', { title, description }),
  update: (id: number, title: string, description: string) =>
    api.put(`/wordlists/${id}`, { title, description }),
  delete: (id: number) => api.delete(`/wordlists/${id}`),
};

export const cardAPI = {
  create: (list_id: number, front: string, front_example: string, back: string) =>
    api.post('/cards', { list_id, front, front_example, back }),
  update: (id: number, front: string, front_example: string, back: string) =>
    api.put(`/cards/${id}`, { front, front_example, back }),
  delete: (id: number) => api.delete(`/cards/${id}`),
};
