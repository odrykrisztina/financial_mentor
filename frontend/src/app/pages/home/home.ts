import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { LangService } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faBullseye,
  faHandshakeAngle,
  faChartLine,
  faLightbulb,
  faLock,
  faUsers, 
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

interface Guidelines {
  icon: IconDefinition;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FontAwesomeModule
  ],
  host: { class: 'block w-full' },
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit, OnDestroy {

  @ViewChild('introVideo') introVideo?: ElementRef<HTMLVideoElement>;
  private videoObserver?: IntersectionObserver;

  constructor(public langSvc: LangService) {}

  get lang() { return this.langSvc.state; }

  guidelines: Guidelines[] = [
    {icon: faBullseye},
    {icon: faHandshakeAngle},
    {icon: faChartLine},
    {icon: faLightbulb},
    {icon: faLock},
    {icon: faUsers}
  ];

  ngAfterViewInit(): void {
    if (!this.introVideo) return;

    const videoEl = this.introVideo.nativeElement;
    videoEl.volume = 0.3;

    this.videoObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const ratio = entry.intersectionRatio;
        if (ratio >= 0.5) {
          videoEl.play().catch(() => {
          });
        } else {
          videoEl.pause();
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );

    this.videoObserver.observe(videoEl);
  }

  ngOnDestroy(): void {
    if (this.videoObserver && this.introVideo) {
      this.videoObserver.unobserve(this.introVideo.nativeElement);
      this.videoObserver.disconnect();
    }
  }
}
