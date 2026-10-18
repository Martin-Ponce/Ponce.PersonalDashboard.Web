import { Component, computed, input } from '@angular/core';

export interface BarChartItem {
  label: string;
  value: number;
  valueLabel?: string;
  tone?: BarTone;
}

export type BarTone = 'success' | 'danger';

@Component({
  selector: 'app-bar-chart',
  template: `
    <div
      class="bar-chart"
      [style.height.px]="height()"
      role="list"
      [attr.aria-label]="label() || null"
    >
      @for (bar of bars(); track bar.label) {
        <div class="bar-chart__column" role="listitem">
          <span class="bar-chart__value">{{ bar.valueLabel ?? bar.value }}</span>
          <div
            class="bar-chart__bar"
            [class]="bar.tone ? 'bar-chart__bar--' + bar.tone : ''"
            [style.height.px]="bar.barHeight"
          ></div>
          <span class="bar-chart__label">{{ bar.label }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      flex-grow: 1;
    }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 14px;
      box-sizing: border-box;
      padding: 8px 4px 0;
      border-bottom: 2px solid var(--color-chart-baseline);
    }

    .bar-chart__column {
      flex-grow: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }

    .bar-chart__value {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
    }

    .bar-chart__bar {
      width: 100%;
      max-width: 42px;
      border-radius: 10px 10px 4px 4px;
      background:
        linear-gradient(90deg, var(--color-gloss) 0 35%, var(--color-gloss-fade) 60%),
        var(--color-accent-bar);
      box-shadow: 0 3px 8px var(--color-shadow);
    }

    .bar-chart__bar--success,
    .bar-chart__bar--danger {
      box-sizing: border-box;
      border: 1px solid;
    }

    .bar-chart__bar--success {
      border-color: var(--color-success-deep);
      background:
        linear-gradient(90deg, var(--color-gloss) 0 35%, var(--color-gloss-fade) 60%),
        var(--color-success);
    }

    .bar-chart__bar--danger {
      border-color: var(--color-danger-deep);
      background:
        linear-gradient(90deg, var(--color-gloss) 0 35%, var(--color-gloss-fade) 60%),
        var(--color-danger);
    }

    .bar-chart__label {
      padding-bottom: 4px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text);
    }
  `,
})
export class BarChart {
  items = input.required<BarChartItem[]>();
  max = input<number>();
  /** Total height in px. */
  height = input(196);
  /** Bar height in px at `max`. */
  maxBarHeight = input(112);
  label = input<string>();

  protected readonly bars = computed(() => {
    const items = this.items();
    const max = this.max() ?? Math.max(...items.map((item) => item.value), 1);
    return items.map((item) => ({
      ...item,
      barHeight: Math.round((item.value / max) * this.maxBarHeight()),
    }));
  });
}
