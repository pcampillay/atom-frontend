import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtService } from '../../../core/auth/jwt.service';
import { ApiResponse } from '../../../shared/models/api.models';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = 'users';

  constructor(
    private jwtService: JwtService
  ) { }

  /**
   * Obtiene todos los usuarios
   * @returns Observable con la lista de todos los usuarios
   */
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.jwtService.http.get<ApiResponse<User[]>>(this.endpoint);
  }

  /**
   * Busca un usuario por su dirección de email
   * @param email Email del usuario a buscar
   * @returns Observable con la información del usuario encontrado
   */
  findUserByEmail(email: string): Observable<ApiResponse<{ id: string, exists: boolean }>> {
    return this.jwtService.postWithJwt<ApiResponse<{ id: string, exists: boolean }>, { email: string }>(
      `${this.endpoint}/find`,
      { email }
    );
  }

  /**
   * Crea un nuevo usuario con la dirección de email proporcionada
   * @param email Email del nuevo usuario
   * @returns Observable con el ID del usuario creado
   */
  createUser(email: string): Observable<ApiResponse<{ id: string }>> {
    return this.jwtService.postWithJwt<ApiResponse<{ id: string }>, { email: string }>(
      `${this.endpoint}/create`,
      { email }
    );
  }
}