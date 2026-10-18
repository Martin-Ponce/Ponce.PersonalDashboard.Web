import { Routes } from '@angular/router';

export const OVERVIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview').then((x) => x.Overview),
  },
];
