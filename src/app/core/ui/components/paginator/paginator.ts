import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '../icon/icon';
import { Select } from '../select/select';
import { SelectOption } from '../../models/select-option';

export const DEFAULT_PAGE_SIZE = 10;

const MAX_PAGES_WITHOUT_GAPS = 7;

let nextPaginatorId = 0;

/** `page` is 1-based. */
export function pageOf<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Row range, page buttons and a rows-per-page picker (1-based pages). */
@Component({
  selector: 'app-paginator',
  imports: [FormsModule, TranslocoPipe, Icon, Select],
  template: `
    <div class="paginator">
      <span>
        {{ 'common.pagination.showing' | transloco }}
        <b class="paginator__range">{{ from() }}–{{ to() }}</b>
        {{ 'common.pagination.of' | transloco: { total: total() } }}
      </span>

      <nav class="paginator__pages" [attr.aria-label]="'common.pagination.pages' | transloco">
        <button
          type="button"
          class="paginator__arrow"
          [disabled]="page() <= 1"
          [attr.aria-label]="'common.pagination.previous' | transloco"
          (click)="goTo(page() - 1)"
        >
          <app-icon name="chevron-left" [size]="14" [strokeWidth]="2.6" />
        </button>
        @for (button of buttons(); track $index) {
          @if (button === null) {
            <span class="paginator__gap" aria-hidden="true">…</span>
          } @else {
            <button
              type="button"
              class="paginator__page"
              [class.paginator__page--current]="button === page()"
              [attr.aria-current]="button === page() ? 'page' : null"
              [attr.aria-label]="'common.pagination.page' | transloco: { page: button }"
              (click)="goTo(button)"
            >
              {{ button }}
            </button>
          }
        }
        <button
          type="button"
          class="paginator__arrow"
          [disabled]="page() >= pages()"
          [attr.aria-label]="'common.pagination.next' | transloco"
          (click)="goTo(page() + 1)"
        >
          <app-icon name="chevron-right" [size]="14" [strokeWidth]="2.6" />
        </button>
      </nav>

      <span class="paginator__size">
        <label [for]="sizeId">{{ 'common.pagination.rowsPerPage' | transloco }}</label>
        <app-select
          [selectId]="sizeId"
          [items]="sizeOptions()"
          [ngModel]="pageSize()"
          (ngModelChange)="changeSize($event)"
        />
      </span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .paginator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px 16px;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .paginator__range {
      color: var(--color-text);
    }

    .paginator__pages,
    .paginator__size {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .paginator__size {
      gap: 8px;
    }

    .paginator__page,
    .paginator__arrow {
      height: 34px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-border-strong);
      background: var(--gradient-surface);
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
      cursor: pointer;
    }

    .paginator__page {
      min-width: 34px;
      padding: 0 8px;
      border-radius: 10px;
    }

    .paginator__arrow {
      width: 34px;
      padding: 0;
      border-radius: 50%;
    }

    .paginator__page:focus-visible,
    .paginator__arrow:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .paginator__page--current {
      border-color: var(--color-accent-deep);
      background: var(--gradient-gloss), var(--color-accent);
      color: var(--color-text-on-accent);
      text-shadow: 0 1px 1px var(--color-shadow-dark);
      cursor: default;
    }

    .paginator__arrow:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .paginator__gap {
      min-width: 24px;
      text-align: center;
      font-weight: 800;
    }

    @media (max-width: 760px) {
      .paginator__pages {
        order: 1;
        flex-basis: 100%;
        justify-content: center;
      }
    }
  `,
})
export class Paginator {
  total = input.required<number>();
  page = model.required<number>();
  pageSize = model.required<number>();
  pageSizes = input([10, 25, 50]);

  protected readonly sizeId = `app-paginator-size-${nextPaginatorId++}`;

  protected readonly pages = computed(() => pageCount(this.total(), this.pageSize()));
  protected readonly from = computed(() =>
    this.total() ? (this.page() - 1) * this.pageSize() + 1 : 0,
  );
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  protected readonly sizeOptions = computed<SelectOption<number>[]>(() =>
    this.pageSizes().map((size) => ({ label: String(size), value: size })),
  );

  /** Page numbers to show, null is a "…" gap. */
  protected readonly buttons = computed<(number | null)[]>(() => {
    const count = this.pages();
    const current = this.page();
    if (count <= MAX_PAGES_WITHOUT_GAPS) return Array.from({ length: count }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (current > 3) pages.push(null);
    for (let n = Math.max(2, current - 1); n <= Math.min(count - 1, current + 1); n++)
      pages.push(n);
    if (current < count - 2) pages.push(null);
    pages.push(count);
    return pages;
  });

  protected goTo(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.pages()));
  }

  protected changeSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }
}
