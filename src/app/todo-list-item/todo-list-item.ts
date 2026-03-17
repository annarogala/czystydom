import { Component, inject, output, signal } from '@angular/core';
import { Location, Interval, TodoItem } from '../types.js';
import { TodoService } from '../todo.service.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'TodoListItem',
  templateUrl: './todo-list-item.html',
  styleUrl: './todo-list-item.scss',
  inputs: ['todo', 'todos'],
  imports: [FormsModule, CommonModule],
})
export class TodoListItem {
  todo!: TodoItem;

  private readonly locationToBadgeNumber: Record<Location, number> = {
    Kuchnia: 1,
    Sypialnia: 2,
    Salon: 3,
    Łazienka: 4,
    Balkon: 5,
    Przedpokój: 6,
    'Całe mieszkanie': 7,
  };

  // Outputs to notify parent component
  todoUpdated = output<TodoItem>();
  todoDeleted = output<number>();

  private todoService = inject(TodoService);

  // Edit mode
  editingId = signal<number | null>(null);
  editDescription = signal('');
  editLocation = signal<Location>('Salon');
  editInterval = signal<Interval>('1 tydzień');

  // Available options
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

  startEdit(todo: TodoItem) {
    this.editingId.set(todo.id);
    this.editDescription.set(todo.description);
    this.editLocation.set(todo.location);
    this.editInterval.set(todo.interval);
  }

  saveEdit(todo: TodoItem) {
    const description = this.editDescription().trim();
    if (!description) return;

    const updates = {
      description,
      location: this.editLocation(),
      interval: this.editInterval(),
    };

    this.todoService.updateTodo(todo.id, updates).subscribe({
      next: (updatedTodo) => {
        this.todoUpdated.emit(updatedTodo);
        this.editingId.set(null);
      },
      error: (err) => console.error('Error updating todo:', err),
    });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  markAsCleaned(todo: TodoItem) {
    this.todoService.markAsCleaned(todo.id).subscribe({
      next: (updatedTodo) => {
        this.todoUpdated.emit(updatedTodo);
      },
      error: (err) => console.error('Error marking as cleaned:', err),
    });
  }

  deleteTodo(todo: TodoItem) {
    if (confirm(`Czy na pewno chcesz usunąć: ${todo.description}?`)) {
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.todoDeleted.emit(todo.id);
        },
        error: (err) => console.error('Error deleting todo:', err),
      });
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Nigdy';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getDaysSinceLastCleaned(todo: TodoItem): number {
    if (!todo.lastCleaned) return Infinity;

    const now = new Date();
    const lastCleaned = new Date(todo.lastCleaned);
    const diffTime = Math.abs(now.getTime() - lastCleaned.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getIntervalDays(interval: Interval): number {
    switch (interval) {
      case '1 tydzień':
        return 7;
      case '2 tygodnie':
        return 14;
      case '1 miesiąc':
        return 30;
      case '3 miesiące':
        return 90;
      case '6 miesięcy':
        return 180;
    }
  }

  getStatusClass(todo: TodoItem): string {
    const daysSince = this.getDaysSinceLastCleaned(todo);
    if (daysSince === Infinity) return 'status-never';

    const intervalDays = this.getIntervalDays(todo.interval);

    switch (intervalDays) {
      case 7:
        if (daysSince < 3) return 'status-good';
        if (daysSince < 5) return 'status-warning';
        return 'status-urgent';
      case 14:
        if (daysSince < 10) return 'status-good';
        if (daysSince < 12) return 'status-warning';
        return 'status-urgent';
      case 30:
        if (daysSince < 18) return 'status-good';
        if (daysSince < 24) return 'status-warning';
        return 'status-urgent';
      case 60:
        if (daysSince < 38) return 'status-good';
        if (daysSince < 50) return 'status-warning';
        return 'status-urgent';
      case 90:
        if (daysSince < 68) return 'status-good';
        if (daysSince < 80) return 'status-warning';
        return 'status-urgent';
      case 180:
        if (daysSince < 144) return 'status-good';
        if (daysSince < 160) return 'status-warning';
        return 'status-urgent';
      default:
        return 'status-good';
    }
    // const percentage = (daysSince / intervalDays) * 100;

    // if (percentage < 50) return 'status-good';
    // if (percentage < 80) return 'status-warning';
    // if (percentage < 100) return 'status-urgent';
    // return 'status-overdue';
  }

  getDaysLabel(days: number): string {
    if (days === 1) return 'dzień';
    if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) return 'dni';
    return 'dni';
  }

  getStatusText(todo: TodoItem): string {
    const daysSince = this.getDaysSinceLastCleaned(todo);
    if (daysSince === Infinity) return 'Nie sprzątane';

    return `${daysSince} ${this.getDaysLabel(daysSince)} temu`;
  }

  getLocationBadgeClass(location: Location): string {
    const badgeNumber = this.locationToBadgeNumber[location] ?? 0;
    return `location-${badgeNumber}`;
  }
}
