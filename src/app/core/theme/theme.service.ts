import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(false);
  private renderer: Renderer2;
  private isBrowser: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initTheme();
  }

  /**
   * Inicializa el tema basado en la preferencia guardada o la configuración del sistema
   */
  private initTheme(): void {
    if (!this.isBrowser) return;

    try {
      // Verificar si hay preferencia guardada en localStorage
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme) {
        this.darkTheme.next(savedTheme === 'true');
      } else {
        // Detectar preferencia del sistema operativo
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.darkTheme.next(prefersDark);
      }
      // Aplicar el tema actual
      this.applyTheme(this.darkTheme.value);
    } catch (error) {
      // En caso de error, usar tema claro por defecto
      console.warn('Error al inicializar tema, usando tema claro por defecto', error);
    }
  }

  /**
   * Obtiene un Observable del estado del tema oscuro
   */
  isDarkTheme$(): Observable<boolean> {
    return this.darkTheme.asObservable();
  }

  /**
   * Obtiene el valor actual del tema oscuro
   */
  isDarkTheme(): boolean {
    return this.darkTheme.value;
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    if (!this.isBrowser) return;

    try {
      const newValue = !this.darkTheme.value;
      this.darkTheme.next(newValue);
      localStorage.setItem('darkTheme', String(newValue));
      this.applyTheme(newValue);
    } catch (error) {
      console.error('Error al cambiar el tema', error);
    }
  }

  /**
   * Aplica la clase de tema oscuro al elemento HTML
   */
  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;

    if (isDark) {
      this.renderer.addClass(this.document.documentElement, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.documentElement, 'dark-theme');
    }

    // Actualizar el meta tag theme-color para la UI del navegador móvil
    this.updateMetaThemeColor(isDark);
  }

  /**
   * Actualiza el meta tag theme-color para reflejar el tema actual
   */
  private updateMetaThemeColor(isDark: boolean): void {
    if (!this.isBrowser) return;

    const themeColor = isDark ? '#1a120a' : '#fff8f5';
    let meta = this.document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.setAttribute('content', themeColor);
    } else {
      meta = this.document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', themeColor);
      this.document.head.appendChild(meta);
    }
  }
}