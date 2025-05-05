import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserService } from '../../users/services/user.service';
import { LoginComponent } from './login.component';

// Preparamos un método de prueba directo para evitar el diálogo
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogMock: any;

  // Configuración predeterminada para SnackBar
  const snackBarConfig: MatSnackBarConfig = {
    duration: 5000
  };

  beforeEach(async () => {
    // Crear spies para los servicios
    userServiceSpy = jasmine.createSpyObj('UserService', ['findUserByEmail', 'createUser']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['clearUserSession', 'setUserSession']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Mock simple para MatDialog
    dialogMock = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(true)
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        LoginComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Reemplazamos el método openConfirmDialog para evitar usar MatDialog
    // Simulamos en su lugar los comportamientos resultantes directamente
    component.openConfirmDialog = jasmine.createSpy('openConfirmDialog').and.callFake((email: string) => {
      // Llamamos directamente al método createUser (simulando un resultado positivo del diálogo)
      component.createUser(email);
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a login form containing only email field', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeNull(); // No debería tener campo password
  });

  it('should mark email as invalid with empty value', () => {
    component.loginForm.patchValue({
      email: ''
    });

    component.onSubmit();

    expect(component.loginForm.valid).toBeFalse();
    expect(component.loginForm.get('email')?.errors).toBeTruthy();
    expect(userServiceSpy.findUserByEmail).not.toHaveBeenCalled();
  });

  it('should mark email as invalid with incorrect format', () => {
    component.loginForm.patchValue({
      email: 'invalid-email'
    });

    component.onSubmit();

    expect(component.loginForm.valid).toBeFalse();
    expect(component.loginForm.get('email')?.errors?.['email']).toBeTruthy();
    expect(userServiceSpy.findUserByEmail).not.toHaveBeenCalled();
  });

  it('should submit valid email and find existing user', () => {
    // Configurar el mock para simular un usuario existente
    userServiceSpy.findUserByEmail.and.returnValue(of({
      success: true,
      data: { id: 'user123', exists: true },
      message: 'Usuario encontrado'
    }));

    // Llenar el formulario con un email válido
    component.loginForm.patchValue({
      email: 'test@example.com'
    });

    // Simular el envío del formulario
    component.onSubmit();

    // Verificar que se llamó al servicio con el email correcto
    expect(userServiceSpy.findUserByEmail).toHaveBeenCalledWith('test@example.com');

    // Verificar que se guardó la sesión y se redirigió correctamente
    expect(authServiceSpy.setUserSession).toHaveBeenCalledWith('user123', 'test@example.com');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks', 'user123']);
  });

  it('should open confirmation dialog and create user when user is not found', () => {
    // Configurar el mock para simular un usuario que no existe
    userServiceSpy.findUserByEmail.and.returnValue(of({
      success: true,
      data: { id: '', exists: false },
      message: 'Usuario no encontrado'
    }));

    // Configurar mock para la creación de usuario exitosa
    userServiceSpy.createUser.and.returnValue(of({
      success: true,
      data: { id: 'new-user-123' },
      message: 'Usuario creado con éxito'
    }));

    // Llenar el formulario con un email válido
    component.loginForm.patchValue({
      email: 'new@example.com'
    });

    // Simular el envío del formulario
    component.onSubmit();

    // Verificar que se llamó a findUserByEmail
    expect(userServiceSpy.findUserByEmail).toHaveBeenCalledWith('new@example.com');

    // Verificar que se llamó a openConfirmDialog
    expect(component.openConfirmDialog).toHaveBeenCalledWith('new@example.com');

    // Verificar que se creó el usuario
    expect(userServiceSpy.createUser).toHaveBeenCalledWith('new@example.com');

    // Verificar que se guardó la sesión y se redirigió correctamente
    expect(authServiceSpy.setUserSession).toHaveBeenCalledWith('new-user-123', 'new@example.com');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks', 'new-user-123']);
  });

  it('should handle error when checking email', fakeAsync(() => {
    userServiceSpy.findUserByEmail.and.returnValue(
      throwError(() => ({ message: 'Error de conexión', status: 500 }))
    );
    component.loginForm.patchValue({
      email: 'test@example.com'
    });
    component.onSubmit();
    tick();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Error al verificar el email. Por favor, intente nuevamente.',
      'Cerrar',
      jasmine.objectContaining({ duration: 5000 })
    );
  }));
});
