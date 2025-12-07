import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth.interceptor';
import { AuthService } from './core/auth.service';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';
import { LangService } from './core/lang.service';

export function initLang(lang: LangService) {
  return () => lang.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    LangService,
    provideAppInitializer(() => {
      inject(LangService).init();
      const auth = inject(AuthService);
      return firstValueFrom(auth.ensureSession());
    })
  ]
};
