'use client';
import ClientLayout from './client-layout';
import TodoList from '@/components/TodoList';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ClientLayout>
      <main>
        <ErrorBoundary>
          <TodoList />
        </ErrorBoundary>
        <div>
          {process.env.NODE_ENV === 'development' && (
            <Link href="/test-error" className="view-link">
              Trigger Error Test
            </Link>
          )}
        </div>
      </main>
    </ClientLayout>
  );
}