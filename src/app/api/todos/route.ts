import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    console.log('Request URL:', request.url);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Requested ID:', id);

    if (!id) {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos', {
        timeout: 10000,
      }).catch(err => {
        console.error('Network error for todos list:', err.message);
        throw new Error('Failed to fetch todos list');
      });
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid API response data');
      }
      const apiTodos = response.data.slice(0, 20);
      console.log('API response (list):', apiTodos);
      return NextResponse.json(apiTodos);
    }

    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      console.log('Invalid ID format:', id);
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const response = await axios.get(`https://jsonplaceholder.typicode.com/todos/${numId}`, {
      timeout: 10000,
    }).catch(err => {
      console.error('Network error for todo ID:', err.message);
      throw new Error(`Failed to fetch todo ${numId}`);
    });
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);

    if (response.status === 200) {
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid todo data');
      }
      return NextResponse.json(response.data);
    }
    if (response.status === 404) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    if (response.status >= 500) {
      throw new Error(`Server error from API: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API error:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch todos', details: errorMessage }, { status: 500 });
  }
}