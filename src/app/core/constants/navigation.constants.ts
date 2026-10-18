import { IconName } from '../ui/assets/icons/icons';

export interface NavRoute {
  labelKey: string;
  routePage: string;
  icon: IconName;
}

export const NAV_ROUTES: NavRoute[] = [
  { labelKey: 'nav.overview', routePage: '/overview', icon: 'overview' },
  { labelKey: 'nav.finances', routePage: '/finances', icon: 'spending' },
  { labelKey: 'nav.calendar', routePage: '/calendar', icon: 'calendar' },
  { labelKey: 'nav.jobApplications', routePage: '/job-applications', icon: 'briefcase' },
  { labelKey: 'nav.goals', routePage: '/goals', icon: 'goals' },
  { labelKey: 'nav.settings', routePage: '/settings', icon: 'settings' },
];
