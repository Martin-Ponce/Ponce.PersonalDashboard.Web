import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { APP_VERSION } from '../../../constants/app.constants';

/** App version on a little LCD-style display. */
@Component({
  selector: 'app-version-badge',
  imports: [TranslocoPipe],
  template: `
    <div class="version">
      <span class="version__label">{{ 'shell.version' | transloco }}</span>
      <span class="version__badge">v{{ version }}</span>
    </div>
  `,
  styles: `
    .version {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .version__badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 15px;
      font-weight: bold;
      letter-spacing: 1px;
      color: var(--color-lcd-text);
      background: linear-gradient(var(--color-lcd-start), var(--color-lcd-end));
      box-shadow:
        inset 0 1px 3px var(--color-shadow-dark),
        0 1px 0 var(--color-white);
    }

    @media (max-width: 760px) {
      .version__label {
        display: none;
      }
    }
  `,
})
export class VersionBadge {
  protected readonly version = APP_VERSION;
}
