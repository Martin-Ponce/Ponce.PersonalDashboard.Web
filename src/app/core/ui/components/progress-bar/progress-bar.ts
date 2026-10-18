import { Component, computed, input } from '@angular/core';

/** auto picks green, yellow or red from `warnAt` and `dangerAt`. */
export type ProgressTone = 'auto' | 'success' | 'warning' | 'danger' | 'accent';
export type ProgressSize = 'md' | 'sm';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="progress"
      [class.progress--sm]="size() === 'sm'"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="value()"
      [attr.aria-label]="label() || null"
    >
      <div
        class="progress__fill"
        [class]="'progress__fill--' + resolvedTone()"
        [style.width.%]="width()"
      ></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .progress {
      height: 14px;
      border-radius: 999px;
      background: var(--color-track);
      box-shadow: inset 0 1px 2px var(--color-shadow-dark);
      overflow: hidden;
    }

    .progress--sm {
      height: 12px;
    }

    .progress__fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .progress__fill--success {
      background: var(--gradient-gloss), var(--color-success);
    }

    .progress__fill--warning {
      background: var(--gradient-gloss), var(--color-notice);
    }

    .progress__fill--danger {
      background: var(--gradient-gloss), var(--color-danger);
    }

    .progress__fill--accent {
      background: var(--gradient-gloss), var(--color-accent);
    }
  `,
})
export class ProgressBar {
  /** Percentage, can go over 100. */
  value = input.required<number>();
  tone = input<ProgressTone>('auto');
  warnAt = input(50);
  dangerAt = input(75);
  size = input<ProgressSize>('md');
  label = input<string>();

  protected readonly width = computed(() => Math.max(0, Math.min(this.value(), 100)));

  protected readonly resolvedTone = computed(() => {
    if (this.tone() !== 'auto') return this.tone();
    if (this.value() >= this.dangerAt() || this.value() > 100) return 'danger';
    return this.value() >= this.warnAt() ? 'warning' : 'success';
  });
}
