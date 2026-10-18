import { Routes } from '@angular/router';

export const JOB_APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./job-applications').then((x) => x.JobApplications),
  },
];
