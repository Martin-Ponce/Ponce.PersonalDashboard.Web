import { Routes } from '@angular/router';

export const GOALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./goals').then((x) => x.Goals),
  },
];
