import { Routes } from '@angular/router';

export const FINANCES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./finances').then((x) => x.Finances),
  },
];
