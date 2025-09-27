import Dexie, { type Table } from 'dexie';

export interface TodoItem {
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
  data: TodoItem | number;
}

class TodoDatabase extends Dexie {
  todos!: Table<TodoItem, number>;
  deletedTodos!: Table<DeletedTodo, number>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('TodoDatabase');
    this.version(1).stores({
      todos: '++id, title, completed, userId',
      deletedTodos: 'id',
      syncQueue: '++id, action'
    });
  }
}

export const db = new TodoDatabase();