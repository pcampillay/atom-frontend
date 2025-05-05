import { Task } from '../../modules/tasks/models/task.model';
import { ApiResponse } from '../models/api.models';

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Tarea de prueba 1',
    description: 'Descripción de la tarea de prueba 1',
    completed: false,
    userId: 'user123',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Tarea de prueba 2',
    description: 'Descripción de la tarea de prueba 2',
    completed: true,
    userId: 'user123',
    created_at: new Date().toISOString(),
  }
];

export const MOCK_TASKS_RESPONSE: ApiResponse<Task[]> = {
  success: true,
  data: MOCK_TASKS,
  message: 'Tareas obtenidas con éxito'
};

export const MOCK_TASK_CREATE_RESPONSE: ApiResponse<{ id: string }> = {
  success: true,
  data: { id: '3' },
  message: 'Tarea creada con éxito'
};

export const MOCK_TASK_UPDATE_RESPONSE: ApiResponse<void> = {
  success: true,
  message: 'Tarea actualizada con éxito'
};

export const MOCK_TASK_DELETE_RESPONSE: ApiResponse<void> = {
  success: true,
  message: 'Tarea eliminada con éxito'
};