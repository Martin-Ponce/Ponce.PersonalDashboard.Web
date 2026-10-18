import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DEFAULT_SIGNED_IN_ROUTE, LOGIN_ROUTE, SKIP_SIGN_IN } from '../constants/auth.constants';
import { AuthService } from '../services/auth-service';

/** Signed-in users only; everyone else goes to login with a returnUrl. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (SKIP_SIGN_IN || inject(AuthService).isAuthenticated()) return true;
  return inject(Router).createUrlTree([`/${LOGIN_ROUTE}`], {
    queryParams: { returnUrl: state.url },
  });
};

/** Keeps signed-in users off the login page. */
export const guestGuard: CanActivateFn = () =>
  SKIP_SIGN_IN || inject(AuthService).isAuthenticated()
    ? inject(Router).parseUrl(DEFAULT_SIGNED_IN_ROUTE)
    : true;
