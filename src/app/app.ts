import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './todo.service';

export type Room = 'sypialnia' | 'salon' | 'łazienka' | 'kuchnia' | 'balkon' | 'całe mieszkanie';
export type Interval = '1 tydzień' | '2 tygodnie' | '1 miesiąc' | '3 miesiące' | '6 miesięcy';

export interface TodoItem {
  id: number;
  description: string;
  room: Room;
  interval: Interval;
  lastCleaned: Date | null;
}

type SortBy = 'alphabet' | 'room' | 'time';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private todoService = inject(TodoService);
  protected readonly title = signal('Czysty Dom');
  
  // Form fields
  newDescription = signal('');
  newRoom = signal<Room>('salon');
  newInterval = signal<Interval>('1 tydzień');
  
  // Edit mode
  editingId = signal<number | null>(null);
  editDescription = signal('');
  editRoom = signal<Room>('salon');
  editInterval = signal<Interval>('1 tydzień');
  
  // Data
  todos = signal<TodoItem[]>([]);
  nextId = signal(1);
  
  // Sorting
  sortBy = signal<SortBy>('time');
  
  // Available options
  rooms: Room[] = ['sypialnia', 'salon', 'łazienka', 'kuchnia', 'balkon', 'całe mieszkanie'];
  intervals: Interval[] = ['1 tydzień', '2 tygodnie', '1 miesiąc', '3 miesiące', '6 miesięcy'];
  
  // Sorted todos
  sortedTodos = computed(() => {
    const items = [...this.todos()];
    const sortType = this.sortBy();
    
    switch (sortType) {
      case 'alphabet':
        return items.sort((a, b) => a.description.localeCompare(b.description));
      case 'room':
        return items.sort((a, b) => a.room.localeCompare(b.room));
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
      room: this.newRoom(),
      interval: this.newInterval()
    };
    
    this.todoService.createTodo(todoData).subscribe({
      next: (newTodo) => {
        this.todos.update(todos => [...todos, newTodo]);
        // Reset form
        this.newDescription.set('');
        this.newRoom.set('salon');
        this.newInterval.set('1 tydzień');
      },
      error: (err) => console.error('Error creating todo:', err)
    });
  }
  
  markAsCleaned(todo: TodoItem) {
    this.todoService.markAsCleaned(todo.id).subscribe({
      next: (updatedTodo) => {
        this.todos.update(todos =>
          todos.map(t => t.id === todo.id ? updatedTodo : t)
        );
      },
      error: (err) => console.error('Error marking as cleaned:', err)
    });
  }
  
  startEdit(todo: TodoItem) {
    this.editingId.set(todo.id);
    this.editDescription.set(todo.description);
    this.editRoom.set(todo.room);
    this.editInterval.set(todo.interval);
  }
  
  saveEdit(todo: TodoItem) {
    const description = this.editDescription().trim();
    if (!description) return;
    
    const updates = {
      description,
      room: this.editRoom(),
      interval: this.editInterval()
    };
    
    this.todoService.updateTodo(todo.id, updates).subscribe({
      next: (updatedTodo) => {
        this.todos.update(todos =>
          todos.map(t => t.id === todo.id ? updatedTodo : t)
        );
        this.editingId.set(null);
      },
      error: (err) => console.error('Error updating todo:', err)
    });
  }
  
  cancelEdit() {
    this.editingId.set(null);
  }
  
  deleteTodo(todo: TodoItem) {
    if (confirm(`Czy na pewno chcesz usunąć: ${todo.description}?`)) {
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.todos.update(todos => todos.filter(t => t.id !== todo.id));
        },
        error: (err) => console.error('Error deleting todo:', err)
      });
    }
  }
  
  getDaysSinceLastCleaned(todo: TodoItem): number {
    if (!todo.lastCleaned) return Infinity;
    
    const now = new Date();
    const lastCleaned = new Date(todo.lastCleaned);
    const diffTime = Math.abs(now.getTime() - lastCleaned.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  getIntervalDays(interval: Interval): number {
    switch (interval) {
      case '1 tydzień': return 7;
      case '2 tygodnie': return 14;
      case '1 miesiąc': return 30;
      case '3 miesiące': return 90;
      case '6 miesięcy': return 180;
    }
  }
  
  getStatusClass(todo: TodoItem): string {
    const daysSince = this.getDaysSinceLastCleaned(todo);
    if (daysSince === Infinity) return 'status-never';
    
    const intervalDays = this.getIntervalDays(todo.interval);
    const percentage = (daysSince / intervalDays) * 100;
    
    if (percentage < 50) return 'status-good';
    if (percentage < 80) return 'status-warning';
    if (percentage < 100) return 'status-urgent';
    return 'status-overdue';
  }
  
  getStatusText(todo: TodoItem): string {
    const daysSince = this.getDaysSinceLastCleaned(todo);
    if (daysSince === Infinity) return 'Nigdy nie sprzątane';
    
    return `${daysSince} ${this.getDaysLabel(daysSince)} temu`;
  }
  
  getDaysLabel(days: number): string {
    if (days === 1) return 'dzień';
    if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) return 'dni';
    return 'dni';
  }
  
  formatDate(date: Date | null): string {
    if (!date) return 'Nigdy';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  setSortBy(sort: SortBy) {
    this.sortBy.set(sort);
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
      }
    });
  }
}
