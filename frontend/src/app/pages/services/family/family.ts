import { Component } from '@angular/core';
import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHandsHoldingChild, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-family',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './family.html',
  styleUrl: './family.css'
})
export class Family {

  icon = { faHandsHoldingChild, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "FAMILY",
      "name_id": "message_family"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
