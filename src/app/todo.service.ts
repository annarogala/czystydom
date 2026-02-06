import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TodoItem } from './types.js';

export interface TodoData {
  todos: TodoItem[];
  nextId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private http = inject(HttpClient);
  // Lokalnie: http://localhost:3000/api/todos
  // Na Vercel: /api/todos (rewrites w vercel.json)
  private apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/todos'
    : '/api/todos';

  getAllTodos(): Observable<TodoData> {
    return this.http.get<TodoData>(this.apiUrl);
  }

  createTodo(todo: Omit<TodoItem, 'id' | 'lastCleaned'>): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.apiUrl, todo);
  }

  updateTodo(id: number, todo: Partial<TodoItem>): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.apiUrl}/${id}`, todo);
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAsCleaned(id: number): Observable<TodoItem> {
    return this.http.patch<TodoItem>(`${this.apiUrl}/${id}/clean`, {});
  }
}
