import { Component, computed, input } from '@angular/core';

export type GoalDotState = 'done' | 'bonus' | 'missed' | 'planned' | 'off';

/** One day's dot in a daily goal's week. */
@Component({
  selector: 'app-goal-dot',
  host: { '[title]': 'tooltip() || null' },
  template: `
    <span
      class="dot"
      [class]="'dot--' + state()"
      [class.dot--sm]="size() === 'sm'"
      [class.dot--selected]="selected()"
      aria-hidden="true"
      >{{ symbol() }}</span
    >
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }

    .dot {
      width: 24px;
      height: 24px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .dot--sm {
      width: 18px;
      height: 18px;
      font-size: 10px;
    }

    .dot--done,
    .dot--bonus {
      border: 1px solid var(--color-success-deep);
      background: var(--gradient-gloss), var(--color-success);
      color: var(--color-text-on-accent);
    }

    .dot--missed {
      border: 1px solid var(--color-danger-deep);
      background: var(--gradient-gloss), var(--color-danger);
      color: var(--color-text-on-accent);
    }

    .dot--planned {
      border: 2px solid var(--color-accent);
      background: var(--color-white);
      color: var(--color-accent-deep);
    }

    .dot--off {
      border: 1px dashed var(--color-border);
      color: var(--color-neutral);
    }

    .dot--selected {
      box-shadow:
        0 0 0 2px var(--color-white),
        0 0 0 4px var(--color-text);
    }
  `,
})
export class GoalDot {
  state = input.required<GoalDotState>();
  letter = input('');
  size = input<'sm' | 'md'>('md');
  selected = input(false);
  tooltip = input<string>();

  protected readonly symbol = computed(() => {
    const state = this.state();
    if (state === 'done' || state === 'bonus') return '✓';
    return state === 'missed' ? '!' : this.letter();
  });
}
