import { Component, computed, input, output } from '@angular/core';
import { IconName } from '../../assets/icons/icons';
import { Icon } from '../icon/icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'danger-outline'
  | 'icon'
  | 'danger-icon'
  | 'on-accent'
  | 'link';

/** lg is for a screen's one main action. */
export type ButtonSize = 'lg' | 'md' | 'sm';

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  danger: 'btn btn--danger',
  'danger-outline': 'btn btn--danger-outline',
  icon: 'btn btn--icon',
  'danger-icon': 'btn btn--icon btn--danger-icon',
  'on-accent': 'btn btn--on-accent',
  link: 'btn btn--link',
};

@Component({
  selector: 'app-button',
  host: { '[class.btn-host--full]': 'fullWidth()' },
  imports: [Icon],
  styleUrl: './button.css',
  template: `
    @if (isVisible()) {
      <button
        [type]="type()"
        [class]="classes()"
        [disabled]="isDisabled()"
        [attr.autofocus]="autoFocus() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.title]="tooltip() || null"
        [attr.aria-expanded]="expanded() ?? null"
        (click)="clicked.emit()"
      >
        @if (iconName(); as icon) {
          <app-icon [name]="icon" [size]="size() === 'lg' ? 20 : 16" [strokeWidth]="2.2" />
        }
        @if (text()) {
          <span>{{ text() }}</span>
        }
        @if (badge() !== undefined) {
          <span class="btn__badge">{{ badge() }}</span>
        }
      </button>
    }
  `,
})
export class Button {
  text = input<string>();
  iconName = input<IconName>();
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  fullWidth = input(false);
  type = input<'button' | 'submit'>('button');
  isVisible = input(true);
  isDisabled = input(false);
  autoFocus = input(false);
  ariaLabel = input<string>();
  tooltip = input<string>();
  expanded = input<boolean>();
  active = input(false);
  badge = input<string | number>();

  clicked = output<void>();

  protected readonly classes = computed(() =>
    [
      BUTTON_CLASSES[this.variant()],
      this.size() === 'md' ? '' : `btn--${this.size()}`,
      this.fullWidth() ? 'btn--full' : '',
      this.active() ? 'btn--active' : '',
    ].join(' '),
  );
}
