import { Component } from '@angular/core';
import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHouseCrack, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-corporate',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './corporate.html',
  styleUrl: './corporate.css'
})
export class Corporate {

  icon = { faHouseCrack, faFileSignature };
  
  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "CORPORATE",
      "name_id": "message_corporate"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
