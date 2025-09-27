import type { ReactElement } from 'react';

export const dynamic = 'force-dynamic';

export default function TestError(): ReactElement {
  if (process.env.NODE_ENV !== 'development') {
    return <div>Test Error Page</div>;
  }
  throw new Error('Oops! This is a test error.');
}