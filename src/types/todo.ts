export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface DeletedTodo {
  id: number;
}

export interface SyncQueue {
  id?: number;
  action: 'add' | 'update' | 'delete';
  data: Todo | number;
}