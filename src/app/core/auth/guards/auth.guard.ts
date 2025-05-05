import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Verificar si el usuario está autenticado
  if (!authService.isAuthenticated()) {
    snackBar.open('Sesión no válida. Por favor inicie sesión nuevamente.', 'Cerrar', {
      duration: 5000
    });
    router.navigate(['/login']);
    return false;
  }

  // Si estamos en la ruta de tareas, verificar que el userId en la URL coincida con el de la sesión
  if (route.paramMap.has('userId')) {
    const urlUserId = route.paramMap.get('userId');
    const sessionUserId = authService.getUserId();

    if (urlUserId !== sessionUserId) {
      snackBar.open('Acceso no autorizado. Por favor inicie sesión nuevamente.', 'Cerrar', {
        duration: 5000
      });
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};