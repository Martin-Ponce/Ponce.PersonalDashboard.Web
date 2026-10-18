import { Pipe, PipeTransform, inject } from '@angular/core';
import { FormattingService } from '../services/formatting-service';

/** Formats money with the current language and currency settings. */
@Pipe({
  name: 'money',
  // Impure so it picks up language and settings changes.
  pure: false,
})
export class MoneyPipe implements PipeTransform {
  private readonly formatting = inject(FormattingService);

  transform(amount: number | null | undefined): string {
    return amount == null ? '' : this.formatting.money(amount);
  }
}
