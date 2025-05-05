import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'web';
  isDarkTheme = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    // Suscribirse a los cambios del tema
    this.themeSubscription = this.themeService.isDarkTheme$().subscribe(
      isDark => this.isDarkTheme = isDark
    );
  }

  ngOnDestroy(): void {
    // Limpieza de suscripciones para evitar memory leaks
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
