'use client';
import { useState, useEffect, useCallback } from 'react';
import { db, TodoItem } from '../db/todoDB';
import TodoForm from './TodoForm';
import Link from 'next/link';
import '../app/globals.css';

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [page, setPage] = useState(1);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodos = async () => {
    try {
      const localTodos = await db.todos.toArray();
      if (localTodos.length === 0) {
        // Fetch from JSONPlaceholder if empty
        const response = await fetch('/api/todos');
        if (!response.ok) throw new Error('Failed to fetch initial todos');
        const apiTodos: TodoItem[] = await response.json(); // Explicitly type apiTodos
        await db.todos.bulkAdd(apiTodos);
        setTodos(apiTodos.sort((a: TodoItem, b: TodoItem) => b.id - a.id)); // Type sort parameters
      } else {
        setTodos(localTodos.sort((a: TodoItem, b: TodoItem) => b.id - a.id)); // Type sort parameters
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncQueue = useCallback(async () => {
    if (!isOnline) return;

    try {
      const queue = await db.syncQueue.toArray();
      for (const item of queue) {
        switch (item.action) {
          case 'add':
            await db.todos.put(item.data as TodoItem);
            console.log('Synced add:', item.data);
            break;
          case 'update':
            await db.todos.put(item.data as TodoItem);
            console.log('Synced update:', item.data);
            break;
          case 'delete':
            await db.todos.delete(item.data as number);
            console.log('Synced delete:', item.data);
            break;
        }
        await db.syncQueue.delete(item.id!);
      }
      loadTodos();
    } catch (err) {
      console.error('Sync error:', err);
      setError('Sync failed, some changes may be pending');
    }
  }, [isOnline]);

  useEffect(() => {
    console.log('Initializing Dexie DB');
    db.open().catch(err => console.error('Dexie open error:', err));
    loadTodos();

    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'completed') return matchesSearch && todo.completed;
    return matchesSearch && !todo.completed;
  });

  const ITEMS_PER_PAGE = 10;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentTodos = filteredTodos.slice(start, start + ITEMS_PER_PAGE);

  const addTodoHandler = async (todo: TodoItem) => {
    const id = await db.todos.add(todo);
    setTodos([{ ...todo, id }, ...todos].sort((a: TodoItem, b: TodoItem) => b.id - a.id)); // Type sort parameters
    if (!isOnline) {
      await db.syncQueue.add({ action: 'add', data: { ...todo, id } });
      console.log('Queued add:', { ...todo, id });
    }
    setPage(1);
  };

  const updateTodoHandler = async (todo: TodoItem) => {
    await db.todos.put(todo);
    setTodos(todos.map((t) => (t.id === todo.id ? todo : t)).sort((a: TodoItem, b: TodoItem) => b.id - a.id)); // Type sort parameters
    if (!isOnline) {
      await db.syncQueue.add({ action: 'update', data: todo });
      console.log('Queued update:', todo);
    }
    setEditingTodo(null);
  };

  if (error) return <p className="error-text">Error: {error}</p>;
  if (isLoading) return <p className="loading-text">Loading...</p>;
  if (!todos.length) return <p className="no-todos">No todos yet. Add one!</p>;

  return (
    <div className="todo-container">
      <h1 className="todo-title">Your Todo</h1>
      <div className="control-form">
        <div className="controls">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="search-bar"
          />
          <fieldset className="filter-buttons">
            <label>
              <input
                type="radio"
                name="filter"
                checked={filter === 'all'}
                onChange={() => {
                  setFilter('all');
                  setPage(1);
                }}
              />{' '}
              All
            </label>
            <label>
              <input
                type="radio"
                name="filter"
                checked={filter === 'completed'}
                onChange={() => {
                  setFilter('completed');
                  setPage(1);
                }}
              />{' '}
              Completed
            </label>
            <label>
              <input
                type="radio"
                name="filter"
                checked={filter === 'uncompleted'}
                onChange={() => {
                  setFilter('uncompleted');
                  setPage(1);
                }}
              />{' '}
              Uncompleted
            </label>
          </fieldset>
        </div>
        <TodoForm onSubmit={addTodoHandler} />
      </div>
      <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}>
        Status: {isOnline ? 'Online' : 'Offline'}
      </div>
      {editingTodo && (
        <div className="modal-overlay" onClick={() => setEditingTodo(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Todo</h2>
            <TodoForm initialTodo={editingTodo} onSubmit={updateTodoHandler} />
            <button className="modalCancelBtn" onClick={() => setEditingTodo(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <ul className="todo-list">
        {currentTodos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <span className="todo-title-text">{todo.title}</span>
            <Link href={`/todos/${todo.id}`} className="view-link">
              View Details
            </Link>
            <span className={`todo-status ${todo.completed ? 'completed' : 'incomplete'}`}>
              {todo.completed ? '✅' : '❌'}
            </span>
            <button className="edit-button" onClick={() => setEditingTodo(todo)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={start + ITEMS_PER_PAGE >= filteredTodos.length}>
          Next
        </button>
      </div>
    </div>
  );
}