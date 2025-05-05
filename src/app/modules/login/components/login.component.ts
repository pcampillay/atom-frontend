import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserService } from '../../users/services/user.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    // Limpiar cualquier sesión existente al entrar al login
    this.authService.clearUserSession();

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Getter para facilitar el acceso al control del email
  get emailControl() {
    return this.loginForm.get('email');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;

      // Cambiar el estado de carga y deshabilitar el control
      this.isLoading = true;
      this.emailControl?.disable();

      this.userService.findUserByEmail(email)
        .pipe(finalize(() => {
          // Al finalizar la petición, reactivamos el campo y quitamos el estado de carga
          this.isLoading = false;
          this.emailControl?.enable();
        }))
        .subscribe({
          next: (response) => {
            if (response.success && response.data?.exists) {
              // Guardar información del usuario en localStorage
              this.authService.setUserSession(response.data.id, email);
              // Navegar a la página de tareas con el userId en la URL
              this.router.navigate(['/tasks', response.data.id]);
            } else {
              // El usuario no existe, mostrar modal de confirmación
              this.openConfirmDialog(email);
            }
          },
          error: (error) => {
            if (error.status === 404) {
              // El usuario no existe, mostrar modal de confirmación
              this.openConfirmDialog(email);
            } else {
              this.snackBar.open('Error al verificar el email. Por favor, intente nuevamente.', 'Cerrar', {
                duration: 5000
              });
              console.error('Error al verificar email:', error);
            }
          }
        });
    }
  }

  public openConfirmDialog(email: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // El usuario confirmó la creación
        this.createUser(email);
      }
    });
  }

  public createUser(email: string): void {
    // Cambiar el estado de carga y deshabilitar el control
    this.isLoading = true;
    this.emailControl?.disable();

    this.userService.createUser(email)
      .pipe(finalize(() => {
        // Al finalizar la petición, reactivamos el campo y quitamos el estado de carga
        this.isLoading = false;
        this.emailControl?.enable();
      }))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.id) {
            // Guardar información del usuario en localStorage
            this.authService.setUserSession(response.data.id, email);
            // Navegar a la página de tareas con el userId en la URL
            this.router.navigate(['/tasks', response.data.id]);
          } else {
            this.snackBar.open('Error al crear el usuario. Por favor, intente nuevamente.', 'Cerrar', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          this.snackBar.open('Error al crear el usuario. Por favor, intente nuevamente.', 'Cerrar', {
            duration: 5000
          });
          console.error('Error al crear usuario:', error);
        }
      });
  }
}
