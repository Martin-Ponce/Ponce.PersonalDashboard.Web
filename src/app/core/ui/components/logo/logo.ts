import { Component, input } from '@angular/core';
import { APP_NAME } from '../../../constants/app.constants';

/** md is 44px, lg is 84px. */
export type LogoSize = 'md' | 'lg';

/** App logo, image picked by screen density. */
@Component({
  selector: 'app-logo',
  styleUrl: './logo.css',
  host: {
    role: 'img',
    '[attr.aria-label]': 'name',
    '[class]': "'logo logo--' + size()",
  },
  template: '',
})
export class Logo {
  size = input<LogoSize>('md');

  protected readonly name = APP_NAME;
}
