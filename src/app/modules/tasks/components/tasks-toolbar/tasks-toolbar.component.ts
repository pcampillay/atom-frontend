import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tasks-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './tasks-toolbar.component.html',
  styleUrl: './tasks-toolbar.component.scss'
})
export class TasksToolbarComponent {
  @Input() userEmail: string = '';
  @Output() logoutClicked = new EventEmitter<void>();

  onLogout(): void {
    this.logoutClicked.emit();
  }
}