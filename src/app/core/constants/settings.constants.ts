/** Date formats offered in Settings. */
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export const DATE_FORMATS: { value: DateFormat; pattern: string }[] = [
  { value: 'DD/MM/YYYY', pattern: 'dd/MM/yyyy' },
  { value: 'MM/DD/YYYY', pattern: 'MM/dd/yyyy' },
  { value: 'YYYY-MM-DD', pattern: 'yyyy-MM-dd' },
];

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'MXN', 'JPY', 'CHF'] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const CURRENCIES_WITHOUT_DECIMALS: readonly CurrencyCode[] = ['JPY'];

export const TIME_ZONES: { id: string; labelKey: string }[] = [
  { id: 'Europe/Madrid', labelKey: 'settings.timeZone.zones.madrid' },
  { id: 'Europe/London', labelKey: 'settings.timeZone.zones.london' },
  { id: 'America/New_York', labelKey: 'settings.timeZone.zones.newYork' },
  { id: 'America/Mexico_City', labelKey: 'settings.timeZone.zones.mexicoCity' },
  { id: 'America/Los_Angeles', labelKey: 'settings.timeZone.zones.losAngeles' },
  { id: 'Asia/Tokyo', labelKey: 'settings.timeZone.zones.tokyo' },
  { id: 'UTC', labelKey: 'settings.timeZone.zones.utc' },
];
