import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { JwtService } from '../../../core/auth/jwt.service';
import { MOCK_REGISTER_RESPONSE, MOCK_USER_RESPONSE } from '../../../shared/mocks/user.mock';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let jwtServiceMock: jasmine.SpyObj<JwtService>;
  let httpGetSpy: jasmine.Spy;
  let httpDeleteSpy: jasmine.Spy;

  beforeEach(() => {
    // Crear spies independientes para los métodos http.get y http.delete
    httpGetSpy = jasmine.createSpy('get');
    httpDeleteSpy = jasmine.createSpy('delete');

    // Crear el spy para JwtService con todos los métodos necesarios
    const jwtSpy = jasmine.createSpyObj('JwtService', [
      'postWithJwt'
    ], {
      // Propiedades con getters - nota que http es un objeto con métodos spy
      http: {
        get: httpGetSpy,
        delete: httpDeleteSpy
      }
    });

    // Configurar el spy para postWithJwt
    jwtSpy.postWithJwt.and.returnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: JwtService, useValue: jwtSpy }
      ]
    });

    service = TestBed.inject(UserService);
    jwtServiceMock = TestBed.inject(JwtService) as jasmine.SpyObj<JwtService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should get all users', () => {
      // Configurar el mock para devolver una respuesta con múltiples usuarios
      const usersResponse = {
        success: true,
        data: [MOCK_USER_RESPONSE.data, {
          id: 'user456',
          name: 'Otro Usuario',
          email: 'otro@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        message: 'Usuarios obtenidos con éxito'
      };

      // Usar el spy directamente
      httpGetSpy.and.returnValue(of(usersResponse));

      let result: any;
      service.getAllUsers().subscribe(response => {
        result = response;
      });

      expect(httpGetSpy).toHaveBeenCalledWith('users');
      expect(result).toEqual(usersResponse);
      expect(result.data.length).toBe(2);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', () => {
      const email = 'test@example.com';
      const findResponse = {
        success: true,
        data: { id: 'user123', exists: true },
        message: 'Usuario encontrado'
      };

      jwtServiceMock.postWithJwt.and.returnValue(of(findResponse));

      let result: any;
      service.findUserByEmail(email).subscribe(response => {
        result = response;
      });

      expect(jwtServiceMock.postWithJwt).toHaveBeenCalledWith(
        'users/find',
        { email }
      );
      expect(result).toEqual(findResponse);
      expect(result.data.exists).toBeTrue();
    });

    it('should handle when user is not found', () => {
      const email = 'nonexistent@example.com';
      const findResponse = {
        success: true,
        data: { id: '', exists: false },
        message: 'Usuario no encontrado'
      };

      jwtServiceMock.postWithJwt.and.returnValue(of(findResponse));

      let result: any;
      service.findUserByEmail(email).subscribe(response => {
        result = response;
      });

      expect(jwtServiceMock.postWithJwt).toHaveBeenCalledWith(
        'users/find',
        { email }
      );
      expect(result).toEqual(findResponse);
      expect(result.data.exists).toBeFalse();
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const email = 'new@example.com';

      jwtServiceMock.postWithJwt.and.returnValue(of(MOCK_REGISTER_RESPONSE));

      let result: any;
      service.createUser(email).subscribe(response => {
        result = response;
      });

      expect(jwtServiceMock.postWithJwt).toHaveBeenCalledWith(
        'users/create',
        { email }
      );
      expect(result).toEqual(MOCK_REGISTER_RESPONSE);
      expect(result.data.id).toBe('user123');
    });
  });
});