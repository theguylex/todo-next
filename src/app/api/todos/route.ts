import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    console.log('Request URL:', request.url);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Requested ID:', id);

    if (!id) {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos', { timeout: 10000 });
      if (!response.data || !Array.isArray(response.data)) throw new Error('Invalid API response data');
      const apiTodos = response.data.slice(0, 20);
      console.log('API response (list):', apiTodos);
      return NextResponse.json(apiTodos);
    }

    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });

    const response = await axios.get(`https://jsonplaceholder.typicode.com/todos/${numId}`, { timeout: 10000 });
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);

    if (response.status === 200) {
      if (!response.data || typeof response.data !== 'object') throw new Error('Invalid todo data');
      return NextResponse.json(response.data);
    }
    if (response.status === 404) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    if (response.status >= 500) throw new Error(`Server error from API: ${response.status}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API error:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch todos', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const todo = await request.json();
    const response = await axios.post('https://jsonplaceholder.typicode.com/todos', todo, { timeout: 10000 });
    return NextResponse.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('POST error:', errorMessage);
    return NextResponse.json({ error: 'Failed to add todo', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();
    const todo = await request.json();
    const response = await axios.put(`https://jsonplaceholder.typicode.com/todos/${id}`, todo, { timeout: 10000 });
    return NextResponse.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('PUT error:', errorMessage);
    return NextResponse.json({ error: 'Failed to update todo', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`, { timeout: 10000 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('DELETE error:', errorMessage);
    return NextResponse.json({ error: 'Failed to delete todo', details: errorMessage }, { status: 500 });
  }
}