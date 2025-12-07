import { Component } from '@angular/core';

import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBabyCarriage, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mortgage',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './mortgage.html',
  styleUrl: './mortgage.css'
})
export class Mortgage {

  icon = { faBabyCarriage, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "MORTGAGE",
      "name_id": "message_mortgage"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
