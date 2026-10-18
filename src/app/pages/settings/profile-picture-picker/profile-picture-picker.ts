import { Component, model, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PROFILE_PICTURES, ProfilePicture } from '../../../core/constants/profile.constants';
import { Avatar } from '../../../core/ui/components/avatar/avatar';
import { Icon } from '../../../core/ui/components/icon/icon';
import { Tag } from '../../../core/ui/components/tag/tag';

/** Pick a preset profile picture (uploads come later). */
@Component({
  selector: 'app-profile-picture-picker',
  imports: [TranslocoPipe, Avatar, Icon, Tag],
  template: `
    <div class="picker">
      <div class="picker__preview">
        <app-avatar size="lg" [name]="name()" [picture]="picture()" />
        <span class="picker__preview-name">
          {{ 'settings.picture.options.' + picture() | transloco }}
        </span>
      </div>

      <div
        class="picker__options"
        role="radiogroup"
        [attr.aria-label]="'settings.picture.title' | transloco"
      >
        @for (option of pictures; track option) {
          <button
            type="button"
            role="radio"
            class="picker__option"
            [class.picker__option--selected]="option === picture()"
            [attr.aria-checked]="option === picture()"
            (click)="picture.set(option)"
          >
            <app-avatar [name]="name()" [picture]="option" />
            <span>{{ 'settings.picture.options.' + option | transloco }}</span>
          </button>
        }

        <div
          class="picker__option picker__option--disabled"
          aria-disabled="true"
          [title]="'settings.picture.uploadSoon' | transloco"
        >
          <span class="picker__upload" aria-hidden="true">
            <app-icon name="upload" [size]="20" />
          </span>
          <span>{{ 'settings.picture.upload' | transloco }}</span>
          <app-tag color="warning" [labelText]="'settings.picture.soon' | transloco" />
        </div>
      </div>
    </div>
  `,
  styles: `
    .picker {
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .picker__preview {
      width: 140px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .picker__preview-name {
      font-size: 13px;
      font-weight: 700;
    }

    .picker__options {
      flex-grow: 1;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
      gap: 14px 12px;
    }

    .picker__option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      border: none;
      border-radius: 12px;
      background: transparent;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text);
      cursor: pointer;
    }

    .picker__option:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .picker__option--selected app-avatar {
      border-radius: 50%;
      box-shadow:
        0 0 0 3px var(--color-white),
        0 0 0 6px var(--color-accent),
        0 6px 14px var(--color-shadow);
    }

    .picker__option--disabled {
      color: var(--color-neutral);
      cursor: not-allowed;
    }

    .picker__upload {
      width: 76px;
      height: 76px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px dashed var(--color-border-strong);
      background: var(--color-surface-glass);
    }

    @media (max-width: 760px) {
      .picker {
        flex-direction: column;
      }
    }
  `,
})
export class ProfilePicturePicker {
  name = input.required<string>();
  picture = model.required<ProfilePicture>();

  protected readonly pictures = PROFILE_PICTURES;
}
