import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirestoreTimestamp, Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ScrollingModule,
    TaskCardComponent
  ],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent implements OnChanges, OnInit, OnDestroy {
  @Input() tasks: Task[] = [];
  @Input() isLoading: boolean = false;
  @Output() addClicked = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<Task>();
  @Output() editClicked = new EventEmitter<Task>();
  @Output() deleteClicked = new EventEmitter<Task>();
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  sortedTasks: Task[] = [];

  // Vista virtual itemSize - altura aproximada de cada elemento de tarea
  readonly itemSize = 220;

  // Valores por defecto para los umbrales de precarga
  readonly mobilePreloadRows = 1;  // Filas a precargar en móvil
  readonly desktopPreloadRows = 3; // Filas a precargar en desktop

  // Control para detectar cuando estamos cerca del final para cargar más elementos
  scrollEndThreshold = 200; // Este valor se calculará dinámicamente

  // Posición actual del scroll para detectar cuando cargar más elementos
  currentScrollPosition = 0;

  // Propiedades para controlar el tamaño de pantalla y elementos por fila
  isMobile = false;
  itemsPerRow = 3; // Por defecto, asumimos 3 elementos por fila en desktop
  private breakpointSubscription?: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    // Observar cambios en el tamaño de pantalla para distintos breakpoints
    this.breakpointSubscription = this.breakpointObserver
      .observe([
        '(max-width: 767px)',         // Mobile: 1 columna
        '(min-width: 768px) and (max-width: 1199px)', // Tablet: 2 columnas
        '(min-width: 1200px) and (max-width: 1599px)', // Desktop: 3 columnas
        '(min-width: 1600px)'         // Large Desktop: 4 columnas
      ])
      .subscribe(result => {
        // Determinar el número de items por fila según el breakpoint actual
        if (result.breakpoints['(max-width: 767px)']) {
          this.isMobile = true;
          this.itemsPerRow = 1;
        } else if (result.breakpoints['(min-width: 768px) and (max-width: 1199px)']) {
          this.isMobile = false;
          this.itemsPerRow = 2;
        } else if (result.breakpoints['(min-width: 1200px) and (max-width: 1599px)']) {
          this.isMobile = false;
          this.itemsPerRow = 3;
        } else if (result.breakpoints['(min-width: 1600px)']) {
          this.isMobile = false;
          this.itemsPerRow = 4;
        }

        // Calcular el umbral de carga basado en el tamaño de pantalla
        this.updateScrollThreshold();
      });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  /**
   * Actualiza el umbral de carga basado en el tamaño de pantalla y las filas a precargar
   */
  updateScrollThreshold(): void {
    const rowsToPreload = this.isMobile ? this.mobilePreloadRows : this.desktopPreloadRows;
    // Calculamos el umbral basado en cuántos elementos hay en las filas que queremos precargar
    this.scrollEndThreshold = rowsToPreload * this.itemsPerRow;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando cambia la lista de tareas, actualizamos la lista ordenada
    if (changes['tasks']) {
      this.sortTasks();
    }
  }

  /**
   * Ordena las tareas por fecha de creación (más reciente primero)
   */
  sortTasks(): void {
    this.sortedTasks = [...this.tasks].sort((a, b) => {
      // Verificar si ambos tienen fecha de creación
      if (a.created_at && b.created_at) {
        // Verificar si son timestamps de Firestore
        if (
          typeof a.created_at === 'object' && 'seconds' in a.created_at &&
          typeof b.created_at === 'object' && 'seconds' in b.created_at
        ) {
          // Ordenar por segundos (mayor a menor para más reciente primero)
          return (b.created_at as FirestoreTimestamp).seconds - (a.created_at as FirestoreTimestamp).seconds;
        }

        // En caso de que sea string o Date
        const dateA = new Date(a.created_at as string);
        const dateB = new Date(b.created_at as string);

        return dateB.getTime() - dateA.getTime();
      }

      // Si no hay fechas, mantener el orden original
      return 0;
    });
  }

  /**
   * Función trackBy para mejorar el rendimiento de cdkVirtualFor
   */
  trackByTaskId(index: number, task: Task): string | number {
    return task.id;
  }

  /**
   * Detecta cuando el usuario ha llegado cerca del final del scroll
   * y emite un evento para cargar más tareas
   */
  onScrolledIndexChange(index: number): void {
    this.currentScrollPosition = index;

    if (!this.viewport || this.isLoading) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.sortedTasks.length;

    // Si estamos a "scrollEndThreshold" elementos del final, cargamos más
    if (end > 0 && total > 0 && end >= total - this.scrollEndThreshold) {
      this.loadMore.emit();
    }
  }

  onAddTask(): void {
    this.addClicked.emit();
  }

  onTaskStatusChanged(task: Task): void {
    this.statusChanged.emit(task);
  }

  onTaskEdit(task: Task): void {
    this.editClicked.emit(task);
  }

  onTaskDelete(task: Task): void {
    this.deleteClicked.emit(task);
  }
}