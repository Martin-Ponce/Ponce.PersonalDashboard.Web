import { Component, computed, input } from '@angular/core';
import { ICONS, IconName } from '../../assets/icons/icons';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.stroke-width]="strokeWidth()"
    >
      @for (shape of shapes(); track $index) {
        @switch (shape.kind) {
          @case ('path') {
            <svg:path [attr.d]="shape.d" />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="shape.x"
              [attr.y]="shape.y"
              [attr.width]="shape.width"
              [attr.height]="shape.height"
              [attr.rx]="shape.rx"
            />
          }
          @case ('circle') {
            <svg:circle [attr.cx]="shape.cx" [attr.cy]="shape.cy" [attr.r]="shape.r" />
          }
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
  `,
})
export class Icon {
  name = input.required<IconName>();
  size = input(18);
  strokeWidth = input(2);

  protected readonly shapes = computed(() => ICONS[this.name()]);
}
