import { Component } from '@angular/core';

import { LangService } from '../../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCarBurst, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-ins',
  imports: [
    FontAwesomeModule
],
  host: { class: 'block w-full' },
  templateUrl: './home-ins.html',
  styleUrl: './home-ins.css'
})
export class HomeIns {

  icon = { faCarBurst, faFileSignature };

  constructor(
    public langSvc: LangService,
    private router: Router
  ) {}
    
  get lang() { return this.langSvc.state; }

  applyForContact() {
    const subject = {
      "subject_id": "HOME_CAR",
      "name_id": "message_home_car"
    }
    this.router.navigate(['/contact'], {
      state: { subject: subject }
    });
  }
}
