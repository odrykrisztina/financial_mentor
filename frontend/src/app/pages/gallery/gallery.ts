import { Component, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';              
import { LangService } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-gallery',
  standalone: true,                                          
  imports: [
    CommonModule,                                            
    FontAwesomeModule
  ],
  host: { class: 'block w-full' },
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements AfterViewInit {

  icon = { faImages };

  // Create random images
  galleryImages: string[] = Array.from({ length: 71 }, (_, i) =>
    (i + 1).toString().padStart(2, '0'))
  .map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)

  mounted = signal(false);

  constructor(public langSvc: LangService) {}
    
  get lang() { return this.langSvc.state; }

  ngAfterViewInit() {
    queueMicrotask(() => {
      setTimeout(() => this.mounted.set(true), 100);
    });
  }
}
