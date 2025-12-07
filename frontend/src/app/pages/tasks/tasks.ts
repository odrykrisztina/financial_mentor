import { Component, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';              
import { LangService } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tasks',
  standalone: true,                                          
  imports: [
    CommonModule,                                            
    FontAwesomeModule
  ],
  host: { class: 'block w-full' },
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements AfterViewInit {

  icon = { faListCheck };

  mounted = signal(false);

  constructor(public langSvc: LangService) {}
    
  get lang() { return this.langSvc.state; }

  ngAfterViewInit() {
    queueMicrotask(() => {
      setTimeout(() => this.mounted.set(true), 100);
    });
  }
}
