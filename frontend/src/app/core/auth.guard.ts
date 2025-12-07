import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredTypes = (route.data?.['types'] as string[] | undefined) ?? [];
  const requiredRanks = (route.data?.['ranks'] as string[] | undefined) ?? [];

  return auth.ensureSession().pipe(
    map(ok => {

      if (!ok) return router.createUrlTree(['/']);

      const user = auth.getUser();
      if (!user) return router.createUrlTree(['/']);

      if (requiredTypes.length > 0) {
        if (!user.type || !requiredTypes.includes(user.type))
          return router.createUrlTree(['/']);
      }

      if (requiredRanks.length > 0) {
        if (!user.rank || !requiredRanks.includes(user.rank))
          return router.createUrlTree(['/']);
      }

      return true;
    })
  );
};

export const noAuthGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLogged()
    ? router.createUrlTree(['/'])
    : true;
};
