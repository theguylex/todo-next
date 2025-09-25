import { useState, type FormEvent } from "react";
import { type TodoItem } from "../db/todoDB";

interface Props {
  onSubmit: (todo: TodoItem) => void;
  initialTodo?: TodoItem;
}

export default function TodoForm({ onSubmit, initialTodo }: Props) {
  const [title, setTitle] = useState(initialTodo?.title || "");
  const [completed, setCompleted] = useState(initialTodo?.completed || false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    const todo: TodoItem = {
      id: initialTodo?.id ?? Date.now(),
      userId: 1,
      title: title.trim(),
      completed,
    };
    onSubmit(todo);
    if (!initialTodo) {
      setTitle("");
      setCompleted(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="text-checkbox-input">
       <input
        className="addTodoInput"
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Todo title input"
        />
       <label>
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          aria-label="Todo completed status"
        />
        Completed
       </label>
      </div>
      <button className="addTodoBtn" type="submit">{initialTodo ? "Update" : "Add"} Todo</button>
    </form>
  );
}