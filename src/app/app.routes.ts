import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { LoginComponent } from './modules/login/components/login.component';
import { TasksComponent } from './modules/tasks/components/tasks.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'tasks/:userId',
    component: TasksComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' } // Ruta comodín redirige al login
];
