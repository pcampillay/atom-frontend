import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TasksToolbarComponent } from './tasks-toolbar/tasks-toolbar.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
    TasksToolbarComponent,
    TasksListComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  userId: string = '';
  userEmail: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Obtener el userId de la URL
    this.route.paramMap.subscribe(params => {
      const urlUserId = params.get('userId');

      if (!urlUserId) {
        this.handleInvalidSession('ID de usuario no proporcionado');
        return;
      }

      // Verificar que el userId de la URL coincide con el de la sesión
      const sessionUserId = this.authService.getUserId();

      if (urlUserId !== sessionUserId) {
        this.handleInvalidSession('ID de usuario inválido');
        return;
      }

      // Guardar el userId para su uso en el componente
      this.userId = urlUserId;

      // Obtener el email del servicio de autenticación
      this.userEmail = this.authService.getUserEmail() || 'Usuario';

      // Cargar las tareas del usuario desde el servicio
      this.loadTasks(this.userId);
    });
  }

  loadTasks(userId: string): void {
    this.isLoading = true;
    this.taskService.getUserTasks(userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tasks = response.data || [];
          } else {
            this.showNotification(`Error al cargar tareas: ${response.message}`, 'error');
          }
        },
        error: (err) => {
          console.error('Error al cargar tareas', err);
          this.showNotification('Error al cargar las tareas. Por favor intente nuevamente.', 'error');
        }
      });
  }

  addTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { task: { userId: this.userId } as Task, isNew: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        // Crear la tarea a través del servicio
        this.taskService.createTask(this.userId, {
          title: result.title,
          description: result.description || ''
        })
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.showNotification('Tarea creada con éxito', 'success');
                // Recargar las tareas para obtener la lista actualizada
                this.loadTasks(this.userId);
              } else {
                this.showNotification(`Error al crear tarea: ${response.message}`, 'error');
              }
            },
            error: (err) => {
              console.error('Error al crear tarea', err);
              this.showNotification('Error al crear la tarea. Por favor intente nuevamente.', 'error');
            }
          });
      }
    });
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { task: { ...task }, isNew: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.taskService.updateTask(String(task.id), {
          title: result.title,
          description: result.description
        })
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.showNotification('Tarea actualizada con éxito', 'success');
                // Recargar las tareas para obtener la lista actualizada
                this.loadTasks(this.userId);
              } else {
                this.showNotification(`Error al actualizar tarea: ${response.message}`, 'error');
              }
            },
            error: (err) => {
              console.error('Error al actualizar tarea', err);
              this.showNotification('Error al actualizar la tarea. Por favor intente nuevamente.', 'error');
            }
          });
      }
    });
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar la tarea "${task.title}"?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.taskService.deleteTask(String(task.id))
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.showNotification('Tarea eliminada con éxito', 'success');
                // Actualizar la lista local eliminando la tarea
                this.tasks = this.tasks.filter(t => t.id !== task.id);
              } else {
                this.showNotification(`Error al eliminar tarea: ${response.message}`, 'error');
              }
            },
            error: (err) => {
              console.error('Error al eliminar tarea', err);
              this.showNotification('Error al eliminar la tarea. Por favor intente nuevamente.', 'error');
            }
          });
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    this.isLoading = true;
    this.taskService.updateTaskStatus(String(task.id), task.completed)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification(
              `Tarea marcada como ${task.completed ? 'completada' : 'pendiente'}`,
              'success'
            );
          } else {
            // Revertir el cambio en la UI si la API falla
            task.completed = !task.completed;
            this.showNotification(`Error al actualizar estado: ${response.message}`, 'error');
          }
        },
        error: (err) => {
          console.error('Error al actualizar estado de tarea', err);
          // Revertir el cambio en la UI si hay error
          task.completed = !task.completed;
          this.showNotification('Error al actualizar el estado. Por favor intente nuevamente.', 'error');
        }
      });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  logout(): void {
    // Limpiar la sesión de usuario
    this.authService.clearUserSession();
    this.router.navigate(['/login']);
  }

  private handleInvalidSession(message: string): void {
    this.snackBar.open(`Sesión no válida: ${message}. Por favor inicie sesión nuevamente.`, 'Cerrar', {
      duration: 5000
    });
    this.authService.clearUserSession();
    this.router.navigate(['/login']);
  }
}
