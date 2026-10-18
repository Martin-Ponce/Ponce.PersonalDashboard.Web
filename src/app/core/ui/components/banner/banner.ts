import { Component, input } from '@angular/core';

export type BannerType = 'error';

const BANNER_CLASSES: Record<BannerType, string> = {
  error: 'banner banner--error',
};

@Component({
  selector: 'app-banner',
  template: `<div role="alert" [class]="classes[type()]">{{ text() }}</div>`,
  styles: `
    .banner {
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid transparent;
      font-size: 13px;
      font-weight: 600;
    }

    .banner--error {
      color: var(--color-danger-deep);
      background: var(--gradient-danger-surface);
      border-color: var(--color-danger-border);
    }
  `,
})
export class Banner {
  text = input.required<string>();
  type = input<BannerType>('error');

  protected readonly classes = BANNER_CLASSES;
}
