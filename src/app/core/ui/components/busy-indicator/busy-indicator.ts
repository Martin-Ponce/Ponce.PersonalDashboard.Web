import { Component, input } from '@angular/core';

/** Spinner pill with a short message. */
@Component({
  selector: 'app-busy-indicator',
  template: `
    <div class="busy" role="status">
      <span class="busy__spinner" aria-hidden="true"></span>
      <span>{{ text() }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .busy {
      min-height: 52px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 0 20px;
      border-radius: 999px;
      border: 1px solid var(--color-border-strong);
      background: var(--gradient-surface);
      font-size: 16px;
      font-weight: 700;
      color: var(--color-accent-deep);
    }

    .busy__spinner {
      width: 18px;
      height: 18px;
      box-sizing: border-box;
      flex-shrink: 0;
      border-radius: 50%;
      border: 3px solid var(--color-track);
      border-top-color: var(--color-accent);
      animation: busy-spin 0.8s linear infinite;
    }

    @keyframes busy-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .busy__spinner {
        animation-duration: 2.4s;
      }
    }
  `,
})
export class BusyIndicator {
  text = input.required<string>();
}
