import { Routes } from '@angular/router';
import { noAuthGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => 
      import('./pages/home/home').then(m => m.Home) 
  },
  // { 
  //   path: 'about', 
  //   loadComponent: () => 
  //     import('./pages/about/about').then(m => m.About) 
  // },
  { 
    path: 'contact',
    data: { bodyClass: [ 'forms-enabled' ] }, 
    loadComponent: () => 
      import('./pages/contact/contact').then(m => m.Contact) 
  },
  { 
    path: 'colleagues', 
    loadComponent: () => 
      import('./pages/colleagues/colleagues').then(m => m.Colleagues) 
  },
  { 
    path: 'gallery', 
    loadComponent: () => 
      import('./pages/gallery/gallery').then(m => m.Gallery) 
  },
  { 
    path: 'messages',
    canActivate: [authGuard],
    data: { types: ['W'], bodyClass: [ 'forms-enabled' ] },
    loadComponent: () => 
      import('./pages/messages/messages').then(m => m.Messages) 
  },
  { 
    path: 'pension', 
    loadComponent: () => 
      import('./pages/services/pension/pension').then(m => m.Pension) 
  },
  { 
    path: 'family', 
    loadComponent: () => 
      import('./pages/services/family/family').then(m => m.Family) 
  },
  { 
    path: 'savings', 
    loadComponent: () => 
      import('./pages/services/savings/savings').then(m => m.Savings) 
  },
  { 
    path: 'health', 
    loadComponent: () => 
      import('./pages/services/health/health').then(m => m.Health) 
  },
  { 
    path: 'home-ins', 
    loadComponent: () => 
      import('./pages/services/home-ins/home-ins').then(m => m.HomeIns) 
  },
  { 
    path: 'corporate', 
    loadComponent: () => 
      import('./pages/services/corporate/corporate').then(m => m.Corporate) 
  },
  { 
    path: 'mortgage', 
    loadComponent: () => 
      import('./pages/services/mortgage/mortgage').then(m => m.Mortgage) 
  },
  { 
    path: 'personal', 
    loadComponent: () => 
      import('./pages/services/personal/personal').then(m => m.Personal) 
  },
  { 
    path: 'funds', 
    loadComponent: () => 
      import('./pages/services/funds/funds').then(m => m.Funds) 
  },
  { 
    path: 'securities', 
    loadComponent: () => 
      import('./pages/services/securities/securities').then(m => m.Securities) 
  },
  { 
    path: 'login',
    canActivate: [noAuthGuard],
    data: { bodyClass: [ 'forms-enabled' ] }, 
    loadComponent: () => 
      import('./pages/user/login/login').then(m => m.Login) 
  },
  { 
    path: 'register',
    canActivate: [noAuthGuard],
    data: { bodyClass: [ 'forms-enabled' ] },
    loadComponent: () => 
      import('./pages/user/register/register').then(m => m.Register) 
  },
  { 
    path: 'profile',
    canActivate: [authGuard],
    data: { bodyClass: [ 'forms-enabled' ] },
    loadComponent: () => 
      import('./pages/user/profile/profile').then(m => m.Profile) 
  },
  { 
    path: 'email-change',
    canActivate: [authGuard],
    data: { bodyClass: [ 'forms-enabled' ] }, 
    loadComponent: () => 
      import('./pages/user/email-change/email-change').then(m => m.EmailChange) 
  },
  { 
    path: 'password-change',
    canActivate: [authGuard],
    data: { bodyClass: [ 'forms-enabled' ] },
    loadComponent: () => 
      import('./pages/user/password-change/password-change').then(m => m.PasswordChange) 
  },
  { 
    path: 'password-frogot',
    canActivate: [noAuthGuard],
    data: { bodyClass: [ 'forms-enabled' ] },
    loadComponent: () => 
      import('./pages/user/password-frogot/password-frogot').then(m => m.PasswordFrogot) 
  },
  { 
    path: 'elearning',
    canActivate: [authGuard],
    data: { types: ['W'], bodyClass: [ 'forms-enabled' ] }, 
    loadComponent: () => 
      import('./pages/elearning/elearning').then(m => m.Elearning) 
  },
  { 
    path: 'contracts',
    canActivate: [authGuard],
    data: { types: ['W','U'] },  
    loadComponent: () => 
      import('./pages/contracts/contracts').then(m => m.Contracts) 
  },
  // { 
  //   path: 'tasks',
  //   canActivate: [authGuard],
  //   data: { types: ['W'] }, 
  //   loadComponent: () => 
  //     import('./pages/tasks/tasks').then(m => m.Tasks) 
  // },
  { 
    path: 'settings',
    canActivate: [authGuard],
    data: { types: ['A','W'] }, 
    loadComponent: () => 
      import('./pages/settings/settings').then(m => m.Settings) 
  },
  { path: '**', redirectTo: '' },
];
