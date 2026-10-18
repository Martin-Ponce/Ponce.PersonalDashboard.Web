import { Component, input } from '@angular/core';

export type MetricTone = 'default' | 'success' | 'danger' | 'muted';
export type MetricSize = 'md' | 'sm';

/** Uppercase caption over a big number. */
@Component({
  selector: 'app-metric',
  template: `
    <div class="metric" [class.metric--end]="align() === 'end'">
      <div class="metric__caption">{{ caption() }}</div>
      <div class="metric__value" [class]="'metric__value--' + tone() + ' metric__value--' + size()">
        {{ value() }}
      </div>
    </div>
  `,
  styles: `
    .metric {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .metric--end {
      align-items: flex-end;
    }

    .metric__caption {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .metric__value {
      font-family: var(--font-display);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    .metric__value--md {
      font-size: 24px;
    }

    .metric__value--sm {
      font-size: 18px;
    }

    .metric__value--default {
      color: var(--color-text);
    }

    .metric__value--success {
      color: var(--color-success-text);
    }

    .metric__value--danger {
      color: var(--color-danger-text);
    }

    .metric__value--muted {
      color: var(--color-text-muted);
    }
  `,
})
export class Metric {
  caption = input.required<string>();
  value = input.required<string | number>();
  tone = input<MetricTone>('default');
  size = input<MetricSize>('md');
  align = input<'start' | 'end'>('start');
}
