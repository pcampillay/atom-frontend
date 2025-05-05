import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

interface UserSession {
  userId: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'atom_user_session';
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Guarda la información del usuario en localStorage (solo en navegador)
   */
  setUserSession(userId: string, email: string): void {
    if (this.isBrowser) {
      const userSession: UserSession = { userId, email };
      localStorage.setItem(this.USER_KEY, JSON.stringify(userSession));
    }
  }

  /**
   * Obtiene la información del usuario desde localStorage (solo en navegador)
   */
  getUserSession(): UserSession | null {
    if (!this.isBrowser) {
      return null;
    }

    const userSession = localStorage.getItem(this.USER_KEY);
    if (!userSession) {
      return null;
    }

    try {
      return JSON.parse(userSession) as UserSession;
    } catch (error) {
      console.error('Error al parsear sesión de usuario:', error);
      return null;
    }
  }

  /**
   * Elimina la información del usuario de localStorage (solo en navegador)
   */
  clearUserSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Verifica si el usuario tiene una sesión activa
   */
  isAuthenticated(): boolean {
    return !!this.getUserSession();
  }

  /**
   * Obtiene el ID del usuario actualmente autenticado
   */
  getUserId(): string | null {
    const session = this.getUserSession();
    return session ? session.userId : null;
  }

  /**
   * Obtiene el email del usuario actualmente autenticado
   */
  getUserEmail(): string | null {
    const session = this.getUserSession();
    return session ? session.email : null;
  }

  /**
   * Redirige al usuario al login si no está autenticado
   */
  redirectToLoginIfNotAuthenticated(): boolean {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}