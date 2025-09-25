import ClientLayout from './client-layout';
import TodoList from '@/components/TodoList';
import Link from 'next/link';

export default function Home() {
  return (
    <ClientLayout>
      <main>
        <TodoList />
        <div>
          <Link href="/test-error" className="view-link">
            Trigger Error Test
          </Link>
        </div>
      </main>
    </ClientLayout>
  );
}