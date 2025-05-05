import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Método genérico para realizar peticiones GET
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param params Parámetros HTTP opcionales
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  get<T>(endpoint: string, params?: Record<string, string>, headers?: HttpHeaders): Observable<T> {
    const options = {
      params: new HttpParams({ fromObject: params || {} }),
      headers: headers
    };

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options);
  }

  /**
   * Método genérico para realizar peticiones POST (sin encriptación JWT)
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param body Cuerpo de la petición
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  post<T, U>(endpoint: string, body: U, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Método genérico para realizar peticiones PUT (sin encriptación JWT)
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param body Cuerpo de la petición
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  put<T, U>(endpoint: string, body: U, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Método genérico para realizar peticiones PATCH (sin encriptación JWT)
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param body Cuerpo de la petición
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  patch<T, U>(endpoint: string, body: U, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Método genérico para realizar peticiones DELETE
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { headers });
  }
}