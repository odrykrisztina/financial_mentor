import { Component } from '@angular/core';

import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSackDollar, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-securities',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './securities.html',
  styleUrl: './securities.css'
})
export class Securities {

  icon = { faSackDollar, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "SECURITIES",
      "name_id": "message_securities"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
