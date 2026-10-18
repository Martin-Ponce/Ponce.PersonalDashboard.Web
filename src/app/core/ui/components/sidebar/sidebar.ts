import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SidebarRoute } from '../../models/sidebar-route';
import { Card } from '../card/card';
import { SidebarNavItem } from '../sidebar-nav-item/sidebar-nav-item';

@Component({
  selector: 'app-sidebar',
  imports: [TranslocoPipe, Card, SidebarNavItem],
  template: `
    <app-card [padded]="false">
      <nav class="sidebar" [attr.aria-label]="title() || ('nav.sections' | transloco)">
        <div class="sidebar__title">{{ title() || ('nav.sections' | transloco) }}</div>
        <ul class="sidebar__list">
          @for (route of routes(); track route.routePage) {
            <li>
              <app-sidebar-nav-item
                [label]="route.name"
                [routePage]="route.routePage"
                [icon]="route.icon"
                (clicked)="navigated.emit(route)"
              />
            </li>
          }
        </ul>
      </nav>
    </app-card>
  `,
  styles: `
    :host {
      display: block;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px;
    }

    .sidebar__title {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .sidebar__list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `,
})
export class Sidebar {
  title = input<string>();
  routes = input<SidebarRoute[]>([]);

  navigated = output<SidebarRoute>();
}
