import type { ReactElement } from 'react';

export default function TestError(): ReactElement {
  throw new Error('Oops! This is a test error.');
}