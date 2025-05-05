import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { JwtService } from '../../../core/auth/jwt.service';
import {
  MOCK_TASKS_RESPONSE,
  MOCK_TASK_CREATE_RESPONSE,
  MOCK_TASK_DELETE_RESPONSE,
  MOCK_TASK_UPDATE_RESPONSE
} from '../../../shared/mocks/task.mock';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let jwtServiceMock: jasmine.SpyObj<JwtService>;
  let httpGetSpy: jasmine.Spy;
  let httpDeleteSpy: jasmine.Spy;

  beforeEach(() => {
    // Crear spies independientes para los métodos http.get y http.delete
    httpGetSpy = jasmine.createSpy('get');
    httpDeleteSpy = jasmine.createSpy('delete');

    // Crear el spy para JwtService con todos los métodos necesarios
    const jwtSpy = jasmine.createSpyObj('JwtService', [
      'postWithJwt',
      'patchWithJwt',
      'putWithJwt',
    ], {
      // Propiedades con getters - http es un objeto con métodos spy
      http: {
        get: httpGetSpy,
        delete: httpDeleteSpy
      }
    });

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: JwtService, useValue: jwtSpy }
      ]
    });

    service = TestBed.inject(TaskService);
    jwtServiceMock = TestBed.inject(JwtService) as jasmine.SpyObj<JwtService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTasks', () => {
    it('should get all tasks', () => {
      // Configurar el spy directamente
      httpGetSpy.and.returnValue(of(MOCK_TASKS_RESPONSE));

      // Llamar al método que estamos probando
      let result: any;
      service.getAllTasks().subscribe(response => {
        result = response;
      });

      // Verificar que se llamó al método correcto con los parámetros correctos
      expect(httpGetSpy).toHaveBeenCalledWith('tasks');

      // Verificar que devolvió los datos esperados
      expect(result).toEqual(MOCK_TASKS_RESPONSE);
    });
  });

  describe('getUserTasks', () => {
    it('should get tasks for a specific user', () => {
      const userId = 'user123';
      httpGetSpy.and.returnValue(of(MOCK_TASKS_RESPONSE));

      let result: any;
      service.getUserTasks(userId).subscribe(response => {
        result = response;
      });

      expect(httpGetSpy).toHaveBeenCalledWith(`tasks/user/${userId}`);
      expect(result).toEqual(MOCK_TASKS_RESPONSE);
    });
  });

  describe('createTask', () => {
    it('should create a new task for a user', () => {
      const userId = 'user123';
      const newTask = { title: 'Nueva tarea', description: 'Descripción de la nueva tarea' };

      jwtServiceMock.postWithJwt.and.returnValue(of(MOCK_TASK_CREATE_RESPONSE));

      let result: any;
      service.createTask(userId, newTask).subscribe(response => {
        result = response;
      });

      expect(jwtServiceMock.postWithJwt).toHaveBeenCalledWith(
        `tasks/user/${userId}`,
        newTask
      );
      expect(result).toEqual(MOCK_TASK_CREATE_RESPONSE);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', () => {
      const taskId = '1';
      const completed = true;

      jwtServiceMock.patchWithJwt.and.returnValue(of(MOCK_TASK_UPDATE_RESPONSE));

      let result: any;
      service.updateTaskStatus(taskId, completed).subscribe(response => {
        result = response;
      });

      expect(jwtServiceMock.patchWithJwt).toHaveBeenCalledWith(
        `tasks/${taskId}/status`,
        { completed }
      );
      expect(result).toEqual(MOCK_TASK_UPDATE_RESPONSE);
    });
  });

  describe('updateTask', () => {
    it('should update task title and description', () => {
      const taskId = '1';
      const taskData = { title: 'Título actualizado', description: 'Descripción actualizada' };

      jwtServiceMock.putWithJwt.and.returnValue(of(MOCK_TASK_UPDATE_RESPONSE));

      let result: any;
      service.updateTask(taskId, taskData).subscribe(response => {
        result = response;
      });

      expect(jwtServiceMock.putWithJwt).toHaveBeenCalledWith(
        `tasks/${taskId}`,
        taskData
      );
      expect(result).toEqual(MOCK_TASK_UPDATE_RESPONSE);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      const taskId = '1';

      // Usar el spy directamente
      httpDeleteSpy.and.returnValue(of(MOCK_TASK_DELETE_RESPONSE));

      let result: any;
      service.deleteTask(taskId).subscribe(response => {
        result = response;
      });

      expect(httpDeleteSpy).toHaveBeenCalledWith(`tasks/${taskId}`);
      expect(result).toEqual(MOCK_TASK_DELETE_RESPONSE);
    });
  });
});