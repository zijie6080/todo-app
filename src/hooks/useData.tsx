import { useState, useEffect, useCallback } from 'react';
import type { Task, Category, Subtask } from '../api/types';
import { useAuth } from './useAuth';

// LocalStorage-based data store (replace with Base44 SDK for production)
const TASKS_KEY = 'todo_tasks';
const CATEGORIES_KEY = 'todo_categories';
const SUBTASKS_KEY = 'todo_subtasks';

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useData() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!user) return;
    const allTasks = load<Task>(TASKS_KEY).filter(t => t.user_id === user.id);
    const allCategories = load<Category>(CATEGORIES_KEY).filter(c => c.user_id === user.id);
    const allSubtasks = load<Subtask>(SUBTASKS_KEY);
    setTasks(allTasks.sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime()));
    setCategories(allCategories);
    setSubtasks(allSubtasks);
    setLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  // --- Tasks ---
  const createTask = (data: Omit<Task, 'id' | 'user_id' | 'created_date' | 'updated_date'>) => {
    const all = load<Task>(TASKS_KEY);
    const now = new Date().toISOString();
    const task: Task = { ...data, id: crypto.randomUUID(), user_id: user!.id, created_date: now, updated_date: now };
    all.push(task);
    save(TASKS_KEY, all);
    reload();
    return task;
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    const all = load<Task>(TASKS_KEY);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], ...data, updated_date: new Date().toISOString() };
    save(TASKS_KEY, all);
    reload();
  };

  const deleteTask = (id: string) => {
    const all = load<Task>(TASKS_KEY).filter(t => t.id !== id);
    save(TASKS_KEY, all);
    // Delete subtasks too
    const subs = load<Subtask>(SUBTASKS_KEY).filter(s => s.task_id !== id);
    save(SUBTASKS_KEY, subs);
    reload();
  };

  const toggleTask = (id: string) => {
    const all = load<Task>(TASKS_KEY);
    const task = all.find(t => t.id === id);
    if (!task) return;
    const now = new Date().toISOString();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    task.status = newStatus;
    task.completed_at = newStatus === 'completed' ? now : undefined;
    task.updated_date = now;
    save(TASKS_KEY, all);
    reload();
  };

  // --- Categories ---
  const createCategory = (name: string, color: string) => {
    const data = { name, color };
    const all = load<Category>(CATEGORIES_KEY);
    const cat: Category = { ...data, id: crypto.randomUUID(), user_id: user!.id, created_date: new Date().toISOString() };
    all.push(cat);
    save(CATEGORIES_KEY, all);
    reload();
    return cat;
  };

  const deleteCategory = (id: string) => {
    const all = load<Category>(CATEGORIES_KEY).filter(c => c.id !== id);
    save(CATEGORIES_KEY, all);
    // Unlink tasks
    const allTasks = load<Task>(TASKS_KEY).map(t => t.category_id === id ? { ...t, category_id: undefined } : t);
    save(TASKS_KEY, allTasks);
    reload();
  };

  // --- Subtasks ---
  const createSubtask = (taskId: string, title: string) => {
    const all = load<Subtask>(SUBTASKS_KEY);
    const sub: Subtask = { id: crypto.randomUUID(), task_id: taskId, title, status: 'pending', created_date: new Date().toISOString() };
    all.push(sub);
    save(SUBTASKS_KEY, all);
    reload();
  };

  const toggleSubtask = (id: string) => {
    const all = load<Subtask>(SUBTASKS_KEY);
    const sub = all.find(s => s.id === id);
    if (!sub) return;
    sub.status = sub.status === 'completed' ? 'pending' : 'completed';
    save(SUBTASKS_KEY, all);
    reload();
  };

  const deleteSubtask = (id: string) => {
    const all = load<Subtask>(SUBTASKS_KEY).filter(s => s.id !== id);
    save(SUBTASKS_KEY, all);
    reload();
  };

  const getSubtasksForTask = (taskId: string) => subtasks.filter(s => s.task_id === taskId);

  return {
    tasks, categories, subtasks, loading,
    createTask, updateTask, deleteTask, toggleTask,
    createCategory, deleteCategory,
    createSubtask, toggleSubtask, deleteSubtask, getSubtasksForTask,
    reload,
  };
}
