'use client';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const localTodos = await db.todos.toArray();
        const response = await fetch('/api/todos');
        if (!response.ok) {
          if (response.status === 500) {
            console.warn('API failed, falling back to local todos');
            setTodos(localTodos);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiTodos = await response.json();
        if (!Array.isArray(apiTodos)) throw new Error('Invalid API response');
        const mergedTodos = [...apiTodos, ...localTodos]
          .reduce((acc, todo) => {
            const existing = acc.find((t: TodoItem) => t.id === todo.id);
            return existing ? acc : [...acc, todo];
          }, [] as TodoItem[])
          .sort((a: TodoItem, b: TodoItem) => b.id - a.id);
        setTodos(mergedTodos);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Load error:', errorMessage);
        setError(errorMessage);
        const localTodos = await db.todos.toArray();
        setTodos(localTodos);
      }
    };
    loadTodos();
  }, []);

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
    setTodos([{ ...todo, id }, ...todos].sort((a: TodoItem, b: TodoItem) => b.id - a.id));
  };

  const updateTodoHandler = async (todo: TodoItem) => {
    await db.todos.put(todo);
    setTodos(todos.map((t: TodoItem) => t.id === todo.id ? todo : t).sort((a: TodoItem, b: TodoItem) => b.id - a.id));
    setEditingTodo(null);
  };

  if (error) return <p className="error-text">Error: {error}</p>; // Removed debug string
  if (!todos.length) return <p className="loading-text">Loading...</p>;

  return (
    <div className="todo-container">
      <h1 className="todo-title">Your Todo</h1>
      <div className="control-form">
        <div className="controls">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="search-bar"
          />
          <fieldset className="filter-buttons">
            <label><input type="radio" name="filter" checked={filter === 'all'} onChange={() => { setFilter('all'); setPage(1); }} /> All</label>
            <label><input type="radio" name="filter" checked={filter === 'completed'} onChange={() => { setFilter('completed'); setPage(1); }} /> Completed</label>
            <label><input type="radio" name="filter" checked={filter === 'uncompleted'} onChange={() => { setFilter('uncompleted'); setPage(1); }} /> Uncompleted</label>
          </fieldset>
        </div>
        <TodoForm onSubmit={addTodoHandler} />
      </div>
      {editingTodo && (
        <div className="modal-overlay" onClick={() => setEditingTodo(null)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Todo</h2>
            <TodoForm initialTodo={editingTodo} onSubmit={updateTodoHandler} />
            <button className="modalCancelBtn" onClick={() => setEditingTodo(null)}>Cancel</button>
          </div>
        </div>
      )}
      <ul className="todo-list">
        {currentTodos.map(todo => (
          <li key={todo.id} className="todo-item">
            <span className="todo-title-text">{todo.title}</span>
            <Link href={`/todos/${todo.id}`} className="view-link">View Details</Link>
            <span className={`todo-status ${todo.completed ? 'completed' : 'incomplete'}`}>
              {todo.completed ? '✅' : '❌'}
            </span>
            <button className="edit-button" onClick={() => setEditingTodo(todo)}>Edit</button>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={start + ITEMS_PER_PAGE >= filteredTodos.length}>Next</button>
      </div>
    </div>
  );
}