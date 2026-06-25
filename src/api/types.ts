export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_date?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_date?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  category_id?: string;
  user_id: string;
  completed_at?: string;
  created_date?: string;
  updated_date?: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  status: 'pending' | 'completed';
  created_date?: string;
}
