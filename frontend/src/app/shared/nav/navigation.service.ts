import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  private previousUrl: string = '/';
  private currentUrl: string | undefined;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (this.currentUrl)
          this.previousUrl = this.currentUrl;
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  public getPreviousUrl(): string {
    return this.previousUrl;
  }
  
  public goBack() {
    this.router.navigateByUrl(this.previousUrl);
  }

  public goHome() {
    this.router.navigateByUrl('/');
  }

  public goTo(url: string) {
    url = url.trim();
    if (url.at(0) !== '/') url = '/' + url;
    this.router.navigateByUrl(url);
  }
}
