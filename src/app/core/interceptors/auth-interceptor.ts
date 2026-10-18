import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AUTH_CONFIG } from '../constants/auth.constants';
import { AuthService } from '../services/auth-service';
import { SKIP_AUTH } from './http-context';

/** Adds the bearer token to our API only; on a 401, refreshes and retries once. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH) || !isSecureUrl(req.url, AUTH_CONFIG.secureApiUrls)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return from(auth.getValidAccessToken()).pipe(
    switchMap((token) =>
      next(withBearer(req, token)).pipe(
        catchError((error: unknown) => {
          const rejected = error instanceof HttpErrorResponse && error.status === 401;
          if (!rejected || !token) return throwError(() => error);

          return from(auth.refresh()).pipe(
            switchMap((session) => {
              if (!session) {
                auth.sessionExpired(router.url);
                return throwError(() => error);
              }
              return next(withBearer(req, session.accessToken));
            }),
          );
        }),
      ),
    ),
  );
};

function withBearer(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}

/** Prefix match on a path boundary, so `http://api-evil` doesn't match `http://api`. */
export function isSecureUrl(url: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`),
  );
}
