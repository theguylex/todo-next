'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Todo } from '@/types/todo';
import { db } from '@/db/todoDB';
import { useEffect, useState } from 'react';
import ClientLayout from '../../client-layout';

export default function TodoDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No ID provided');
      return;
    }
    const numId = Number(id);
    fetch(`/api/todos?id=${id}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Todo not found (API)');
          if (res.status === 500) throw new Error(`Server error! status: ${res.status}`);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.details || 'Failed to load todo');
        setTodo(data);
      })
      .catch(async err => {
        console.error('Fetch error:', err);
        setError(err.message);
        const localTodo = await db.todos.get(numId);
        if (localTodo) {
          setTodo(localTodo);
          setError(null);
        }
      });
  }, [id]);

  const deleteTodoHandler = async () => {
    if (id && confirm('Delete this todo?')) {
      try {
        const numId = Number(id);
        await db.todos.delete(numId);
        await db.deletedTodos.put({ id: numId });
        router.push('/');
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete todo');
      }
    }
  };

  if (error) return <p className="error-text">Error: {error}</p>;
  if (!todo) return <p className="loading-text">Loading...</p>;

  return (
    <ClientLayout>
      <main className="todo-container" role="main" aria-labelledby="detail-heading">
        <h1 className="todo-title" id="detail-heading">Todo Details</h1>
        <p><strong>ID:</strong> {todo.id}</p>
        <p><strong>Title:</strong> {todo.title}</p>
        <p><strong>Status:</strong> {todo.completed ? 'Completed ✅' : 'Incomplete ❌'}</p>
        <Link href="/" className="back-button">← Back to list</Link>
        <button className="deleteTodoBtn" onClick={deleteTodoHandler}>Delete Todo</button>
      </main>
    </ClientLayout>
  );
}