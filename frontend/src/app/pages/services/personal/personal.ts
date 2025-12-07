import { Component } from '@angular/core';

import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoneyCheckDollar, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personal',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './personal.html',
  styleUrl: './personal.css'
})
export class Personal {

  icon = { faMoneyCheckDollar, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "PERSONAL_BANK",
      "name_id": "message_personal_bank"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
