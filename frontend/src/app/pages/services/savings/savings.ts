import { Component } from '@angular/core';

import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPiggyBank, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-savings',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './savings.html',
  styleUrl: './savings.css'
})
export class Savings {
  
  icon = { faPiggyBank, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "SAVINGS",
      "name_id": "message_savings"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
