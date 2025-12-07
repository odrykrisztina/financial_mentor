import { Component } from '@angular/core';
import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSuitcaseMedical, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-health',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './health.html',
  styleUrl: './health.css'
})
export class Health {

  icon = { faSuitcaseMedical, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "HEALTH",
      "name_id": "message_health"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
