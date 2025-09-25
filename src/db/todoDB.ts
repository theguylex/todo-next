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

class TodoDatabase extends Dexie {
  todos!: Table<TodoItem, number>;
  deletedTodos!: Table<DeletedTodo, number>;

  constructor() {
    super('TodoDatabase');
    this.version(1).stores({
      todos: '++id, title, completed, userId',
      deletedTodos: 'id'
    });
  }
}

export const db = new TodoDatabase();