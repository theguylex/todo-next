# Next.js Todo Application

This is a Next.js-based todo application built with TypeScript, featuring CRUD operations (Create, Read, Update, Delete), pagination, filtering, and local storage using IndexedDB (via Dexie). It serves as a modern evolution of the TODOALT2 TypeScript todo project, integrating server-side API routes and client-side rendering.

## Table of Contents

Features <br>
Prerequisites
Installation
Usage
API Endpoints
Local Development
Deployment
Troubleshooting
Contributing
License

## Features

Add, edit, delete, and view details of todos.
Paginated todo list with 10 items per page.
Filter todos by "All", "Completed", or "Uncompleted".
Search todos by title.
Local storage using IndexedDB (Dexie) for offline persistence.
Fallback to local data if the external API fails.
Responsive design with basic CSS styling.

## Prerequisites

Node.js (v14.x or later)
npm (v6.x or later)
Git (optional, for version control)

## Installation

Clone the repository:
bashgit clone <https://github.com/theguylex/todo-next>
cd todo-next

Install dependencies:
npm install

Ensure the following dependencies are included (check package.json):

next
react
react-dom
axios
dexie

## Usage

Running the Application

Start the development server:
npm run dev

Open your browser and navigate to <http://localhost:3000/>.

## Functionality

Todo List: View all todos with pagination and filtering options.
Add Todo: Use the form at the top to add a new todo.
Edit Todo: Click "Edit" on a todo to modify its title or completion status.
View Details: Click "View Details" to see a todo's details and delete it.
Search and Filter: Use the search bar and radio buttons to refine the list.

## API Endpoints

GET /api/todos: Fetches a list of todos (up to 20 from JSONPlaceholder).
GET /api/todos?id=id: Fetches a specific todo by ID from JSONPlaceholder, returning a 404 if not found or 500 on error.

Note: The API relies on <https://jsonplaceholder.typicode.com/todos> as a backend. If unavailable, the app falls back to local IndexedDB data.

## Local Development

Run with Turbopack: For faster builds, use:
bashnpm run dev --turbopack --clean
The --clean flag clears the cache if issues persist.
Build for Production:
bashnpm run build
npm start

Debugging: Check the terminal for console.error logs (e.g., API error:) and the browser console for client-side errors.

## Deployment

Build the project:
bashnpm run build

Deploy using a Next.js-compatible platform (e.g., Vercel):

Install the Vercel CLI: npm install -g vercel
Deploy: vercel
Follow the prompts to configure the deployment.

## Troubleshooting

500 Errors: If you see "HTTP error! status: 500", check the terminal logs for API error: details. This may indicate a network issue with JSONPlaceholder or a local configuration problem.
Todos Not Loading: Ensure your internet connection allows access to <https://jsonplaceholder.typicode.com/todos>. If offline, the app should load local todos.
Stale Builds: Use npm run dev --turbopack --clean to refresh the build.
IndexedDB Issues: Verify src/db/todoDb.ts is correctly initialized and accessible client-side.

## Contributing

Feel free to fork this repository and submit pull requests. Please ensure:

Code follows TypeScript best practices.
Changes are tested locally.
Updates are documented in this README.

## License

None
