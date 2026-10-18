import { Routes } from '@angular/router';
import { AUTH_CALLBACK_ROUTE, LOGIN_ROUTE } from './core/constants/auth.constants';
import { authGuard, guestGuard } from './core/guards/auth-guards';
import { Shell } from './core/shell/shell';

export const routes: Routes = [
  {
    path: LOGIN_ROUTE,
    title: 'login.pageTitle',
    canActivate: [guestGuard],
    loadChildren: () => import('./pages/login/login.routes').then((x) => x.LOGIN_ROUTES),
  },
  {
    path: AUTH_CALLBACK_ROUTE,
    title: 'login.callback.pageTitle',
    loadComponent: () =>
      import('./pages/login/callback/login-callback').then((x) => x.LoginCallback),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        title: 'nav.overview',
        loadChildren: () =>
          import('./pages/overview/overview.routes').then((x) => x.OVERVIEW_ROUTES),
      },
      {
        path: 'finances',
        title: 'nav.finances',
        loadChildren: () =>
          import('./pages/finances/finances.routes').then((x) => x.FINANCES_ROUTES),
      },
      {
        path: 'calendar',
        title: 'nav.calendar',
        loadChildren: () =>
          import('./pages/calendar/calendar.routes').then((x) => x.CALENDAR_ROUTES),
      },
      {
        path: 'settings',
        title: 'nav.settings',
        loadChildren: () =>
          import('./pages/settings/settings.routes').then((x) => x.SETTINGS_ROUTES),
      },
      {
        path: 'job-applications',
        title: 'nav.jobApplications',
        loadChildren: () =>
          import('./pages/job-applications/job-applications.routes').then(
            (x) => x.JOB_APPLICATIONS_ROUTES,
          ),
      },
      {
        path: 'goals',
        title: 'nav.goals',
        loadChildren: () => import('./pages/goals/goals.routes').then((x) => x.GOALS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
