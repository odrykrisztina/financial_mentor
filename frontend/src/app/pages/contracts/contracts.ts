import { Component, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';              
import { LangService } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contracts',
  standalone: true,                                          
  imports: [
    CommonModule,                                            
    FontAwesomeModule
  ],
  host: { class: 'block w-full' },
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements AfterViewInit {

  icon = { faHandshake };

  mounted = signal(false);

  constructor(public langSvc: LangService) {}
    
  get lang() { return this.langSvc.state; }

  ngAfterViewInit() {
    queueMicrotask(() => {
      setTimeout(() => this.mounted.set(true), 100);
    });
  }
}
