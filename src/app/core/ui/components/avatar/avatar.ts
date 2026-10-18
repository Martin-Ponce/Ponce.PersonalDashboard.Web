import { Component, computed, input } from '@angular/core';
import { ProfilePicture } from '../../../constants/profile.constants';

/** md is 76px, lg is 112px. */
export type AvatarSize = 'md' | 'lg';

/** Profile avatar: photo, preset picture, or initials. */
@Component({
  selector: 'app-avatar',
  styleUrl: './avatar.css',
  template: `
    <div
      class="avatar"
      [class]="classes()"
      [attr.role]="showsInitials() ? null : 'img'"
      [attr.aria-label]="showsInitials() ? null : name()"
    >
      @if (imageUrl(); as src) {
        <img class="avatar__image" [src]="src" [alt]="name()" />
      } @else if (showsInitials()) {
        <span [attr.aria-label]="name()">{{ initials() }}</span>
      }
    </div>
  `,
})
export class Avatar {
  name = input.required<string>();
  imageUrl = input<string>();
  picture = input<ProfilePicture>();
  size = input<AvatarSize>('md');
  maxInitials = input(2);

  protected readonly showsInitials = computed(
    () => !this.imageUrl() && (!this.picture() || this.picture() === 'initials'),
  );

  protected readonly classes = computed(() =>
    [
      'avatar',
      'avatar--photo',
      `avatar--${this.size()}`,
      this.showsInitials() ? 'avatar--initials' : '',
      !this.imageUrl() && !this.showsInitials() ? `avatar--picture-${this.picture()}` : '',
    ].join(' '),
  );

  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, this.maxInitials())
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );
}
