import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { JwtData } from '../../shared/models/api.models';
import { HttpServiceMock } from './http.service.mock';

export class JwtServiceMock {
  private readonly httpMock = new HttpServiceMock();

  constructor() { }

  encryptData<T>(data: T): Observable<JwtData> {
    // Simulamos un token JWT para pruebas
    return of({ jwtData: 'mock-jwt-token-for-testing' });
  }

  postWithJwt<T, U>(endpoint: string, data: U, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }

  putWithJwt<T, U>(endpoint: string, data: U, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }

  patchWithJwt<T, U>(endpoint: string, data: U, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }

  get http() {
    return {
      get: <T>(endpoint: string, params?: Record<string, string>, headers?: HttpHeaders): Observable<T> =>
        of({} as T),
      delete: <T>(endpoint: string, headers?: HttpHeaders): Observable<T> =>
        of({} as T)
    };
  }
}