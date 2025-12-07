import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

(function applySavedTheme() {
  
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    root.classList.add('dark');
  } else if (saved === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');            
    localStorage.setItem('theme', 'dark');
  }
})();

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));