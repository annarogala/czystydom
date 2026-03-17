import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './todo.service';
import { TodoListItem } from './todo-list-item/todo-list-item';
import { Location, Interval, TodoItem } from './types.js';

type SortBy = 'alphabet' | 'location' | 'time';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, TodoListItem],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App implements OnInit {
  private todoService = inject(TodoService);
  protected readonly title = signal('Czysty Dom');

  // Form fields
  newDescription = signal('');
  newLocation = signal<Location>('Salon');
  newInterval = signal<Interval>('1 tydzień');

  // Edit mode
  editingId = signal<number | null>(null);
  editDescription = signal('');
  editLocation = signal<Location>('Salon');
  editInterval = signal<Interval>('1 tydzień');

  // Data
  todos = signal<TodoItem[]>([]);
  nextId = signal(1);

  // Sorting
  sortBy = signal<SortBy>('time');

  // // Available options
  locations: Location[] = [
    'Sypialnia',
    'Salon',
    'Łazienka',
    'Kuchnia',
    'Balkon',
    'Przedpokój',
    'Całe mieszkanie',
  ];
  intervals: Interval[] = ['1 tydzień', '2 tygodnie', '1 miesiąc', '3 miesiące', '6 miesięcy'];

  // Sorted todos
  sortedTodos = computed(() => {
    const items = [...this.todos()];
    const sortType = this.sortBy();

    switch (sortType) {
      case 'alphabet':
        return items.sort((a, b) => a.description.localeCompare(b.description));
      case 'location':
        return items.sort((a, b) => a.location.localeCompare(b.location));
      case 'time':
        return items.sort((a, b) => {
          const daysA = this.getDaysSinceLastCleaned(a);
          const daysB = this.getDaysSinceLastCleaned(b);
          return daysB - daysA; // Descending: most overdue first
        });
      default:
        return items;
    }
  });

  ngOnInit() {
    // Load from API
    this.loadTodos();
  }

  addTodo() {
    const description = this.newDescription().trim();
    if (!description) return;

    const todoData = {
      description,
      location: this.newLocation(),
      interval: this.newInterval(),
    };

    this.todoService.createTodo(todoData).subscribe({
      next: (newTodo) => {
        this.todos.update((todos) => [...todos, newTodo]);
        // Reset form
        this.newDescription.set('');
        this.newLocation.set('Salon');
        this.newInterval.set('1 tydzień');
      },
      error: (err) => console.error('Error creating todo:', err),
    });
  }

  getDaysSinceLastCleaned(todo: TodoItem): number {
    if (!todo.lastCleaned) return Infinity;

    const now = new Date();
    const lastCleaned = new Date(todo.lastCleaned);
    const diffTime = Math.abs(now.getTime() - lastCleaned.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Metody w komponencie rodzica:
  onTodoUpdated(updatedTodo: TodoItem) {
    this.todos.update((todos) => todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
  }

  onTodoDeleted(todoId: number) {
    this.todos.update((todos) => todos.filter((t) => t.id !== todoId));
  }

  setSortBy(sort: SortBy) {
    this.sortBy.set(sort);
  }

  hardResetTodos() {
    const confirmed = confirm(
      'To zastąpi zawartość todos.json danymi z todos.json.example. Kontynuować?',
    );
    if (!confirmed) return;

    this.todoService.hardReset().subscribe({
      next: (data) => {
        this.todos.set(data.todos || []);
        this.nextId.set(data.nextId || 1);
      },
      error: (err) => {
        console.error('Error hard resetting todos:', err);
        alert('Nie udało się wykonać hard reset.');
      },
    });
  }

  private loadTodos() {
    this.todoService.getAllTodos().subscribe({
      next: (data) => {
        this.todos.set(data.todos || []);
        this.nextId.set(data.nextId || 1);
      },
      error: (err) => {
        console.error('Error loading todos:', err);
        alert('Nie można załadować danych. Upewnij się, że serwer API działa (npm run server).');
      },
    });
  }
}
