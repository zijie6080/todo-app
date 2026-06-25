// Base44 Entity API client
// Replace BASE_URL with your actual Base44 app API endpoint

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token || localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// Auth
export const auth = {
  async register(email: string, password: string, full_name: string) {
    return request<{ token: string; user: { id: string; email: string; full_name: string } }>('/auth/register', {
      method: 'POST',
      body: { email, password, full_name },
    });
  },
  async login(email: string, password: string) {
    return request<{ token: string; user: { id: string; email: string; full_name: string } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },
  async me(token: string) {
    return request<{ id: string; email: string; full_name: string }>('/auth/me', { token });
  },
};

// Entities CRUD factory
function entity<T>(name: string) {
  return {
    async list(filters?: Record<string, unknown>): Promise<T[]> {
      const params = filters ? '?' + new URLSearchParams(filters as Record<string, string>).toString() : '';
      return request<T[]>(`/entities/${name}${params}`);
    },
    async get(id: string): Promise<T> {
      return request<T>(`/entities/${name}/${id}`);
    },
    async create(data: Partial<T>): Promise<T> {
      return request<T>(`/entities/${name}`, { method: 'POST', body: data });
    },
    async update(id: string, data: Partial<T>): Promise<T> {
      return request<T>(`/entities/${name}/${id}`, { method: 'PUT', body: data });
    },
    async delete(id: string): Promise<void> {
      return request<void>(`/entities/${name}/${id}`, { method: 'DELETE' });
    },
    async filter(filters: Record<string, unknown>): Promise<T[]> {
      return request<T[]>(`/entities/${name}/filter`, { method: 'POST', body: filters });
    },
  };
}

import type { Category, Task, Subtask } from './types';

export const Categories = entity<Category>('Category');
export const Tasks = entity<Task>('Task');
export const Subtasks = entity<Subtask>('Subtask');
