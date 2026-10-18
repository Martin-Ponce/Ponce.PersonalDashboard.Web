import { Injectable, computed, inject } from '@angular/core';
import { SettingsService } from './settings-service';

export type OverviewWidget = 'summary' | 'spending' | 'dates' | 'applications';

export type OverviewWidgetVisibility = Record<OverviewWidget, boolean>;

export const OVERVIEW_WIDGETS: { key: OverviewWidget; labelKey: string }[] = [
  { key: 'summary', labelKey: 'overview.customizeWindow.widgets.summary' },
  { key: 'spending', labelKey: 'overview.customizeWindow.widgets.spending' },
  { key: 'dates', labelKey: 'overview.customizeWindow.widgets.dates' },
  { key: 'applications', labelKey: 'overview.customizeWindow.widgets.applications' },
];

const DEFAULT_VISIBILITY: OverviewWidgetVisibility = {
  summary: true,
  spending: true,
  dates: true,
  applications: true,
};

/** Which widgets the overview page shows; part of the user's settings. */
@Injectable({
  providedIn: 'root',
})
export class OverviewPreferencesService {
  private readonly settings = inject(SettingsService);

  readonly widgets = computed(() => this.settings.settings().overviewWidgets);

  setVisible(widget: OverviewWidget, visible: boolean): void {
    this.settings.update({ overviewWidgets: { ...this.widgets(), [widget]: visible } });
  }

  reset(): void {
    this.settings.update({ overviewWidgets: DEFAULT_VISIBILITY });
  }
}
