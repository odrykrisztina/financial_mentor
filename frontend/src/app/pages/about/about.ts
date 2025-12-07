import {  Component } from '@angular/core';

import {  LangService } from '../../core/lang.service';
import {  FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {  faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './about.html',
  styleUrl: './about.css'
})

export class About {

  constructor(public langSvc: LangService) {}

  get lang() { return this.langSvc.state; }
  
  icon = { faCircleInfo };
}
