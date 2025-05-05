import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export class HttpServiceMock {
  private apiUrl = 'http://localhost:3000/api';

  get<T>(endpoint: string, params?: Record<string, string>, headers?: HttpHeaders): Observable<T> {
    // Implementación mock que devuelve un Observable vacío
    return of({} as T);
  }

  post<T, U>(endpoint: string, body: U, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }

  put<T, U>(endpoint: string, body: U, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }

  patch<T, U>(endpoint: string, body: U, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }

  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return of({} as T);
  }
}