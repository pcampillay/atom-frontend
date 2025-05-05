import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtService } from '../../../core/auth/jwt.service';
import { ApiResponse } from '../../../shared/models/api.models';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private endpoint = 'tasks';

  constructor(
    private jwtService: JwtService
  ) { }

  /**
   * Obtiene todas las tareas
   * @returns Observable con la lista de todas las tareas
   */
  getAllTasks(): Observable<ApiResponse<Task[]>> {
    return this.jwtService.http.get<ApiResponse<Task[]>>(this.endpoint);
  }

  /**
   * Obtiene las tareas de un usuario específico
   * @param userId ID del usuario
   * @returns Observable con la lista de tareas del usuario
   */
  getUserTasks(userId: string): Observable<ApiResponse<Task[]>> {
    return this.jwtService.http.get<ApiResponse<Task[]>>(`${this.endpoint}/user/${userId}`);
  }

  /**
   * Crea una nueva tarea para un usuario específico
   * @param userId ID del usuario
   * @param task Datos de la tarea a crear
   * @returns Observable con el ID de la tarea creada
   */
  createTask(userId: string, task: { title: string, description: string }): Observable<ApiResponse<{ id: string }>> {
    return this.jwtService.postWithJwt<ApiResponse<{ id: string }>, { title: string, description: string }>(
      `${this.endpoint}/user/${userId}`,
      task
    );
  }

  /**
   * Actualiza el estado de completado de una tarea
   * @param taskId ID de la tarea
   * @param completed Nuevo estado de completado
   * @returns Observable con la respuesta de la API
   */
  updateTaskStatus(taskId: string, completed: boolean): Observable<ApiResponse<void>> {
    return this.jwtService.patchWithJwt<ApiResponse<void>, { completed: boolean }>(
      `${this.endpoint}/${taskId}/status`,
      { completed }
    );
  }

  /**
   * Actualiza el título y/o descripción de una tarea
   * @param taskId ID de la tarea
   * @param taskData Datos actualizados de la tarea
   * @returns Observable con la respuesta de la API
   */
  updateTask(taskId: string, taskData: { title?: string, description?: string }): Observable<ApiResponse<void>> {
    return this.jwtService.putWithJwt<ApiResponse<void>, { title?: string, description?: string }>(
      `${this.endpoint}/${taskId}`,
      taskData
    );
  }

  /**
   * Elimina una tarea específica
   * @param taskId ID de la tarea a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteTask(taskId: string): Observable<ApiResponse<void>> {
    return this.jwtService.http.delete<ApiResponse<void>>(`${this.endpoint}/${taskId}`);
  }
}