import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jose from 'jose';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpService } from '../../core/http/http.service';
import { JwtData } from '../../shared/models/api.models';



@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private readonly JWT_SECRET = environment.jwtSecret;
  private readonly JWT_EXPIRES = environment.jwtExpiresIn;

  constructor(private httpService: HttpService) { }

  /**
   * Encripta datos con JWT usando la biblioteca jose
   * @param data Datos a encriptar
   * @returns Objeto con el token JWT
   */
  encryptData<T>(data: T): Observable<JwtData> {
    try {
      // Creamos un payload tipado con tiempo de expiración
      const now = Math.floor(Date.now() / 1000);
      // Convertir el tiempo de expiración a segundos
      const expTime = this.JWT_EXPIRES.includes('s')
        ? parseInt(this.JWT_EXPIRES.replace('s', ''))
        : this.JWT_EXPIRES.includes('m')
          ? parseInt(this.JWT_EXPIRES.replace('m', '')) * 60
          : this.JWT_EXPIRES.includes('h')
            ? parseInt(this.JWT_EXPIRES.replace('h', '')) * 3600
            : 3600; // Default a 1h

      // Creamos un objeto plano que cumple con los requisitos de jose
      const payload = {
        data,
        exp: now + expTime
      };

      // Crear un encoder para texto
      const textEncoder = new TextEncoder();

      // Firma el JWT usando la biblioteca jose
      return from(
        new jose.SignJWT(payload)
          .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
          .sign(textEncoder.encode(this.JWT_SECRET))
      ).pipe(
        switchMap(token => {
          return new Observable<JwtData>(subscriber => {
            subscriber.next({ jwtData: token });
            subscriber.complete();
          });
        })
      );
    } catch (error) {
      console.error('Error al encriptar datos con JWT:', error);
      throw new Error('Error al encriptar datos con JWT');
    }
  }

  /**
   * Realiza una petición POST con datos encriptados con JWT
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param data Datos a enviar (serán encriptados)
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  postWithJwt<T, U>(endpoint: string, data: U, headers?: HttpHeaders): Observable<T> {
    return this.encryptData<U>(data).pipe(
      switchMap(encryptedData => {
        const finalHeaders = headers || new HttpHeaders();
        return this.httpService.post<T, JwtData>(endpoint, encryptedData, finalHeaders);
      })
    );
  }

  /**
   * Realiza una petición PUT con datos encriptados con JWT
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param data Datos a enviar (serán encriptados)
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  putWithJwt<T, U>(endpoint: string, data: U, headers?: HttpHeaders): Observable<T> {
    return this.encryptData<U>(data).pipe(
      switchMap(encryptedData => {
        const finalHeaders = headers || new HttpHeaders();
        return this.httpService.put<T, JwtData>(endpoint, encryptedData, finalHeaders);
      })
    );
  }

  /**
   * Realiza una petición PATCH con datos encriptados con JWT
   * @param endpoint Endpoint a llamar (sin la URL base)
   * @param data Datos a enviar (serán encriptados)
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  patchWithJwt<T, U>(endpoint: string, data: U, headers?: HttpHeaders): Observable<T> {
    return this.encryptData<U>(data).pipe(
      switchMap(encryptedData => {
        const finalHeaders = headers || new HttpHeaders();
        return this.httpService.patch<T, JwtData>(endpoint, encryptedData, finalHeaders);
      })
    );
  }

  /**
   * Obtiene los métodos HTTP básicos sin encriptación JWT
   * Para operaciones GET y DELETE que no requieren JWT
   */
  get http() {
    return {
      get: <T>(endpoint: string, params?: Record<string, string>, headers?: HttpHeaders): Observable<T> =>
        this.httpService.get<T>(endpoint, params, headers),
      delete: <T>(endpoint: string, headers?: HttpHeaders): Observable<T> =>
        this.httpService.delete<T>(endpoint, headers)
    };
  }
}