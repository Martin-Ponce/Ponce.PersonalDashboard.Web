import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from '../../../../../../public/i18n/en.json';
import { Paginator, pageCount, pageOf } from './paginator';

@Component({
  imports: [Paginator],
  template: `<app-paginator [total]="total()" [(page)]="page" [(pageSize)]="pageSize" />`,
})
class Host {
  readonly total = signal(42);
  readonly page = signal(1);
  readonly pageSize = signal(10);
}

describe('pageOf / pageCount', () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1);

  it('slices one page of rows', () => {
    expect(pageOf(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(pageOf(items, 3, 10)).toEqual([21, 22, 23]);
  });

  it('counts at least one page', () => {
    expect(pageCount(23, 10)).toBe(3);
    expect(pageCount(20, 10)).toBe(2);
    expect(pageCount(0, 10)).toBe(1);
  });
});

describe('Paginator', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Host,
        TranslocoTestingModule.forRoot({
          langs: { en },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
    }).compileComponents();
  });

  async function render(setup?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    setup?.(fixture.componentInstance);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const text = () => element.textContent!.replace(/\s+/g, ' ').trim();
    const pageButtons = () =>
      [...element.querySelectorAll('.paginator__pages > *')].map((e) => e.textContent!.trim());
    return { fixture, host: fixture.componentInstance, element, text, pageButtons };
  }

  it('shows the range of rows on the page', async () => {
    const { text } = await render((h) => h.page.set(2));
    expect(text()).toContain('Showing 11–20 of 42');
  });

  it('shows every page when there are few', async () => {
    const { pageButtons } = await render();
    // Arrows render no text.
    expect(pageButtons()).toEqual(['', '1', '2', '3', '4', '5', '']);
  });

  it('collapses far pages into gaps', async () => {
    const { pageButtons } = await render((h) => {
      h.total.set(120);
      h.page.set(6);
    });
    expect(pageButtons()).toEqual(['', '1', '…', '5', '6', '7', '…', '12', '']);
  });

  it('moves with the arrows and disables them at the ends', async () => {
    const { fixture, host, element } = await render();
    const [previous, next] = [...element.querySelectorAll<HTMLButtonElement>('.paginator__arrow')];
    expect(previous.disabled).toBe(true);

    next.click();
    await fixture.whenStable();
    expect(host.page()).toBe(2);

    host.page.set(5);
    await fixture.whenStable();
    expect(next.disabled).toBe(true);
  });

  it('marks the current page', async () => {
    const { element } = await render((h) => h.page.set(3));
    const current = element.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('3');
  });

  it('goes back to the first page when the page size changes', async () => {
    const { fixture, host, element } = await render((h) => h.page.set(4));
    const select = element.querySelector('select')!;
    select.value = '25';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.pageSize()).toBe(25);
    expect(host.page()).toBe(1);
  });
});
