import { Component } from '@angular/core';

import {  LangService } from '../../../core/lang.service';
import {  FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {  faPersonCane, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pension',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './pension.html',
  styleUrl: './pension.css'
})
export class Pension {
  
  icon = { faPersonCane, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "PENSION",
      "name_id": "message_pension"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
