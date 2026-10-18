import { ResourceRef, Signal, linkedSignal } from '@angular/core';

/** Keeps the last value while reloading; null before the first load or on error. */
export function latestValue<T>(resource: ResourceRef<T | undefined>): Signal<T | null> {
  return linkedSignal<{ failed: boolean; value: T | undefined }, T | null>({
    source: () => ({
      failed: resource.status() === 'error',
      value: resource.hasValue() ? resource.value() : undefined,
    }),
    computation: ({ failed, value }, previous) =>
      failed ? null : (value ?? previous?.value ?? null),
  });
}
