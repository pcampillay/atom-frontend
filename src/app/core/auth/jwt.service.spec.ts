import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpService } from '../http/http.service';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  let service: JwtService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(() => {
    // Crear un spy para HttpService con todos los métodos necesarios
    const httpSpy = jasmine.createSpyObj('HttpService', [
      'get', 'post', 'put', 'patch', 'delete'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JwtService,
        { provide: HttpService, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(JwtService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('encryptData', () => {
    it('should encrypt data into a JWT token', (done) => {
      const testData = { userId: '123', action: 'test' };

      // Observe el flujo y verifique que devuelve un objeto JWT
      service.encryptData(testData).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.jwtData).toBeDefined();

        // Verificar que el token tiene formato JWT (xxx.yyy.zzz)
        const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
        expect(jwtRegex.test(result.jwtData)).toBeTrue();
        done();
      });
    });
  });

  describe('postWithJwt', () => {
    it('should encrypt data and make a POST request', (done) => {
      const endpoint = 'test-endpoint';
      const testData = { userId: '123', action: 'test' };
      const mockResponse = { success: true, data: { id: '456' } };

      // Configurar el mock para el método post
      httpServiceSpy.post.and.returnValue(of(mockResponse));

      service.postWithJwt(endpoint, testData).subscribe(result => {
        expect(httpServiceSpy.post).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('putWithJwt', () => {
    it('should encrypt data and make a PUT request', (done) => {
      const endpoint = 'test-endpoint/123';
      const testData = { name: 'updated name' };
      const mockResponse = { success: true };

      // Configurar el mock para el método put
      httpServiceSpy.put.and.returnValue(of(mockResponse));

      service.putWithJwt(endpoint, testData).subscribe(result => {
        expect(httpServiceSpy.put).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('patchWithJwt', () => {
    it('should encrypt data and make a PATCH request', (done) => {
      const endpoint = 'test-endpoint/123';
      const testData = { status: 'completed' };
      const mockResponse = { success: true };

      // Configurar el mock para el método patch
      httpServiceSpy.patch.and.returnValue(of(mockResponse));

      service.patchWithJwt(endpoint, testData).subscribe(result => {
        expect(httpServiceSpy.patch).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('http getter', () => {
    it('should provide access to GET and DELETE methods', () => {
      // Verificar que el getter http devuelve un objeto con los métodos get y delete
      expect(service.http).toBeDefined();
      expect(service.http.get).toBeDefined();
      expect(service.http.delete).toBeDefined();

      // Configurar mocks para probar get y delete
      const mockGetResponse = { success: true, data: [1, 2, 3] };
      const mockDeleteResponse = { success: true };

      httpServiceSpy.get.and.returnValue(of(mockGetResponse));
      httpServiceSpy.delete.and.returnValue(of(mockDeleteResponse));

      // Probar método get
      service.http.get('test-endpoint').subscribe(result => {
        expect(result).toEqual(mockGetResponse);
      });
      expect(httpServiceSpy.get).toHaveBeenCalledWith('test-endpoint', undefined, undefined);

      // Probar método delete
      service.http.delete('test-endpoint/123').subscribe(result => {
        expect(result).toEqual(mockDeleteResponse);
      });
      expect(httpServiceSpy.delete).toHaveBeenCalledWith('test-endpoint/123', undefined);
    });
  });
});