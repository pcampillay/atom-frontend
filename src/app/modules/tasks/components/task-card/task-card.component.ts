import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() statusChanged = new EventEmitter<Task>();
  @Output() editClicked = new EventEmitter<Task>();
  @Output() deleteClicked = new EventEmitter<Task>();

  onStatusChanged(): void {
    this.statusChanged.emit(this.task);
  }

  onEdit(): void {
    this.editClicked.emit(this.task);
  }

  onDelete(): void {
    this.deleteClicked.emit(this.task);
  }

  /**
   * Formatea la fecha de creación en un formato legible
   * @param dateValue Valor de fecha (puede ser string ISO o objeto Firestore Timestamp)
   * @returns Fecha formateada (ej: "12 abr 2025")
   */
  formatDate(dateValue: any): string {
    if (!dateValue) {
      return 'Fecha no disponible';
    }

    try {
      let date: Date;

      // Verificar si la fecha es un objeto Firestore Timestamp
      if (typeof dateValue === 'object' && dateValue !== null && 'seconds' in dateValue) {
        // Convertir Firestore Timestamp a Date
        date = new Date(dateValue.seconds * 1000);
      } else {
        // Intentar convertir desde string ISO
        date = new Date(dateValue);
      }

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.log('Fecha inválida después de conversión');
        return 'Fecha no disponible';
      }

      // Opciones para formatear la fecha
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };

      const formattedDate = date.toLocaleDateString('es-ES', options);
      return formattedDate;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha no disponible';
    }
  }
}