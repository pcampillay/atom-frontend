import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subscription } from 'rxjs';
import { AppComponent } from './app.component';
import { ThemeService } from './core/theme/theme.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    // Crear un spy para el ThemeService
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['isDarkTheme$', 'toggleTheme']);
    // Configurar el spy para que devuelva un valor observable
    themeServiceSpy.isDarkTheme$.and.returnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        NoopAnimationsModule,
        AppComponent
      ],
      providers: [
        { provide: ThemeService, useValue: themeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title).toEqual('web');
  });

  it('should initialize with the current theme state', () => {
    // Verificar que el servicio se llamó durante la inicialización
    expect(themeServiceSpy.isDarkTheme$).toHaveBeenCalled();
    // Verificar que se estableció el valor correcto
    expect(component.isDarkTheme).toBeFalse();
  });

  it('should toggle the theme when toggleTheme is called', () => {
    component.toggleTheme();
    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should unsubscribe from theme changes on destroy', () => {
    // Crear una suscripción real y asignarla al componente
    const subscription = new Subscription();
    const unsubscribeSpy = spyOn(subscription, 'unsubscribe');

    // Asignar la suscripción con el espía al componente
    component['themeSubscription'] = subscription;

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
