import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconName } from '../../assets/icons/icons';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-sidebar-nav-item',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <a
      #navLink
      class="nav-item"
      [routerLink]="routePage()"
      routerLinkActive="nav-item--active"
      [routerLinkActiveOptions]="{ exact: false }"
      (click)="clicked.emit()"
      (keydown.space)="activateWithSpace($event, navLink)"
    >
      <app-icon [name]="icon()" />
      <span>{{ label() }}</span>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 42px;
      box-sizing: border-box;
      padding: 0 12px;
      border-radius: 10px;
      border: 1px solid transparent;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
      text-decoration: none;
      transition: background-color 0.15s ease;
    }

    .nav-item:hover:not(.nav-item--active) {
      background: var(--color-row-stripe);
    }

    .nav-item:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .nav-item--active {
      background: var(--gradient-gloss), var(--color-accent);
      border-color: var(--color-accent-deep);
      color: var(--color-text-on-accent);
      font-weight: 700;
      box-shadow: 0 2px 6px var(--color-shadow-strong);
    }
  `,
})
export class SidebarNavItem {
  label = input.required<string>();
  routePage = input.required<string>();
  icon = input.required<IconName>();

  clicked = output<void>();

  activateWithSpace(event: Event, link: HTMLAnchorElement): void {
    event.preventDefault();
    link.click();
  }
}
