import { useState, useEffect, useCallback } from 'react';
import type { Task, Category, Subtask } from '../api/types';
import { useAuth } from './useAuth';
import { callApi } from '../api/client';

export function useData() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ tasks }, { categories }, { subtasks }] = await Promise.all([
        callApi('tasks', { action: 'getTasks', userId: user.id }),
        callApi('tasks', { action: 'getCategories', userId: user.id }),
        callApi('tasks', { action: 'getSubtasksByUser', userId: user.id }),
      ]);
      // Filter out memos from tasks
      setTasks((tasks as any[]).filter((t: any) => t.status !== 'memo').sort(
        (a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime()
      ));
      setCategories(categories as Category[]);
      setSubtasks(subtasks as Subtask[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  // --- Tasks ---
  const createTask = async (data: Omit<Task, 'id' | 'user_id' | 'created_date' | 'updated_date'>) => {
    const { task } = await callApi('tasks', { action: 'createTask', userId: user!.id, data });
    setTasks(prev => [task, ...prev]);
    return task;
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    const { task } = await callApi('tasks', { action: 'updateTask', userId: user!.id, id, data });
    setTasks(prev => prev.map(t => t.id === id ? task : t));
  };

  const deleteTask = async (id: string) => {
    await callApi('tasks', { action: 'deleteTask', userId: user!.id, id });
    setTasks(prev => prev.filter(t => t.id !== id));
    setSubtasks(prev => prev.filter(s => s.task_id !== id));
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const now = new Date().toISOString();
    const { task: updated } = await callApi('tasks', {
      action: 'updateTask',
      userId: user!.id,
      id,
      data: { status: newStatus, completed_at: newStatus === 'completed' ? now : null },
    });
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  // --- Categories ---
  const createCategory = async (name: string, color: string) => {
    const { category } = await callApi('tasks', { action: 'createCategory', userId: user!.id, data: { name, color } });
    setCategories(prev => [...prev, category]);
    return category;
  };

  const deleteCategory = async (id: string) => {
    await callApi('tasks', { action: 'deleteCategory', userId: user!.id, id });
    setCategories(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.map(t => t.category_id === id ? { ...t, category_id: undefined } : t));
  };

  // --- Subtasks ---
  const createSubtask = async (taskId: string, title: string) => {
    const { subtask } = await callApi('tasks', { action: 'createSubtask', userId: user!.id, data: { taskId, title } });
    setSubtasks(prev => [...prev, subtask]);
  };

  const toggleSubtask = async (id: string) => {
    const sub = subtasks.find(s => s.id === id);
    if (!sub) return;
    const newStatus = sub.status === 'completed' ? 'pending' : 'completed';
    const { subtask } = await callApi('tasks', { action: 'updateSubtask', userId: user!.id, id, data: { status: newStatus } });
    setSubtasks(prev => prev.map(s => s.id === id ? subtask : s));
  };

  const deleteSubtask = async (id: string) => {
    await callApi('tasks', { action: 'deleteSubtask', userId: user!.id, id });
    setSubtasks(prev => prev.filter(s => s.id !== id));
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
