import { Component } from '@angular/core';
import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeartPulse, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-funds',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './funds.html',
  styleUrl: './funds.css'
})
export class Funds {

  icon = { faHeartPulse, faFileSignature };
  
  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "FUNDS",
      "name_id": "message_funds"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
