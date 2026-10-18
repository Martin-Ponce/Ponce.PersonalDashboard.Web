import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-status',
  imports: [TranslocoPipe],
  template: `
    <span class="status">
      <span class="status__dot" [class.status__dot--active]="enabled()"></span>
      {{
        enabled()
          ? activeLabel() || ('common.online' | transloco)
          : inactiveLabel() || ('common.offline' | transloco)
      }}
    </span>
  `,
  styles: `
    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .status__dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--color-neutral);
    }

    .status__dot--active {
      background: radial-gradient(
        circle at 35% 35%,
        var(--color-success-glow),
        var(--color-success-deep)
      );
    }
  `,
})
export class Status {
  enabled = input(false);
  activeLabel = input<string>();
  inactiveLabel = input<string>();
}
