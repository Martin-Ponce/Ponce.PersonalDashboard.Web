import { Component, input } from '@angular/core';
import { IconName } from '../../assets/icons/icons';
import { Icon } from '../icon/icon';

/** Tag look: soft pills, solid pills or badges. */
export type TagColor =
  | 'info'
  | 'warning'
  | 'success'
  | 'danger'
  | 'purple'
  | 'neutral'
  | 'success-solid'
  | 'danger-solid'
  | 'neutral-solid'
  | 'alert'
  | 'notice'
  | 'accent'
  | 'accent-soft';

@Component({
  selector: 'app-tag',
  imports: [Icon],
  styleUrl: './tag.css',
  template: `
    <span
      class="tag"
      [class]="'tag--' + color()"
      [class.tag--with-count]="count() !== undefined"
      [title]="labelText()"
    >
      @if (count() !== undefined) {
        <span class="tag__count">{{ count() }}</span>
      }
      @if (iconName(); as icon) {
        <app-icon class="tag__icon" [name]="icon" [size]="12" [strokeWidth]="2.6" />
      }
      {{ labelText() }}
    </span>
  `,
})
export class Tag {
  labelText = input.required<string>();
  color = input<TagColor>('neutral');
  count = input<number>();
  iconName = input<IconName>();
}
