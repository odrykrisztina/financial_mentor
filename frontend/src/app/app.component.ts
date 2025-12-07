import { Component, OnInit } from '@angular/core';
import { 
  RouterOutlet, Router, NavigationEnd, ActivatedRoute 
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { ModalComponent } from './shared/modal/modal';
import { NavigationService } from './shared/nav/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent, 
    FooterComponent,
    ModalComponent
  ],
  templateUrl: './app.component.html',
})

export class AppComponent implements OnInit {

  private lastRouteClass: string | null = null;
  private bodyClass: Array<string> | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private nav: NavigationService  //necessary
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
      
      // Current route data marking body class
      this.routeDataMarkingBodyClass();

      // Current route marking
      this.routeMarking();
    });
  }

  // Current route data marking body class
  private routeDataMarkingBodyClass(): void {
    
    // Check previous body class exist
    if (this.bodyClass && this.bodyClass.length)
      document.body.classList.remove(...this.bodyClass);
    this.bodyClass = null;

    // Check current body class exist
    let route = this.route.root;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot?.data?.['bodyClass'] &&
          Array.isArray(route.snapshot?.data?.['bodyClass']) &&
          route.snapshot?.data?.['bodyClass'].length) { 
        this.bodyClass = route.snapshot?.data?.['bodyClass'];  
        break; 
      }
    }

    // When exist then add class to body
    if (this.bodyClass && this.bodyClass.length)
      document.body.classList.add(...this.bodyClass);
  }

  // Current route marking
  private routeMarking(): void {

    // Check previous route class exist
    if (this.lastRouteClass)
        document.body.classList.remove(this.lastRouteClass);

    // Create current route class
    let currentRouteClass = this.router.url;
    if (!currentRouteClass) return;
    currentRouteClass = currentRouteClass.replaceAll('/', '-');
    if (currentRouteClass === '-') currentRouteClass += 'home';
    currentRouteClass = 'route' + currentRouteClass;

    // Add class to body, and save current route class
    document.body.classList.add(currentRouteClass);
    this.lastRouteClass = currentRouteClass;
  }
}
